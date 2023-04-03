const { CommandHandler } = require("./Commands.js");
const Uploader = require("revolt-uploader");
const { Revoice } = require("revoice.js");
const { Client } = require("revolt.js");
const path = require("path");
const fs = require("fs");
const { SettingsManager } = require("./settings/Settings.js");
if (!process.execArgv.includes("--inspect")) require('console-stamp')(console, 'HH:MM:ss.l');

const Genius = require("genius-lyrics");

let config;
if (fs.existsSync("./config.json")) {
  config = require("./config.json");
} else {
  config = {
    token: process.env.TOKEN
  };
}

class Remix {
  constructor() {
    this.client = new Client();
    this.client.config = config;
    this.config = config;
    this.modules = require("./storage/modules.json");
    this.spotifyConfig = config.spotify;
    this.announceSong = config.songAnnouncements;
    this.presenceInterval = config.presenceInterval || 7000;

    this.observedUsers = new Map();
    this.observedReactions = new Map();

    this.settingsMgr = new SettingsManager();
    this.settingsMgr.loadDefaultsSync("./storage/defaults.json");

    this.uploader = new Uploader(this.client);

    this.geniusClient = new Genius.Client(this.config.geniusToken);

    console.log("Starting");
    console.log("Loading optional modules...");
    this.loadedModules = new Map();
    this.modules.forEach(m => {
      if (!m.enabled) return;
      const mod = { instance: new (require(m.index))(this), c: require(m.index) };
      this.loadedModules.set(m.name, mod);
    });
    console.log(`Loaded ${this.loadedModules.size} module(s): ${Array.from(this.loadedModules).map(m=>m[0]).join(", ")}`)

    this.stats = require("./storage/stats.json");

    this.client.on("ready", () => {
      console.log("Logged in as " + this.client.user.username);
    });
    this.client.once("ready", () => {
      let state = 0;
      let def = ["Ping for prefix", "By RedTech | NoLogicAlan", "Servers: $serverCount"];
      let texts = config.presenceContents || def;
      if (texts.length == 0) texts = def;
      setInterval(() => {
        this.client.users.edit({
          status: {
            text: texts[state].replace(/\$serverCount/g, this.client.servers.size),
            presence: "Online"
          },
        });
        if (state == texts.length - 1) {state = 0} else {state++}
      }, this.presenceInterval);
      if (!this.config.fetchUsers) return;
      this.fetchUsers();
      setInterval(() => this.fetchUsers, 60 * 1000 * 30);
    });
    this.client.on("message", (m) => {
      if (!this.observedUsers.has(m.author_id + ";" + m.channel_id)) return;
      this.observedUsers.get(m.author_id + ";" + m.channel_id)(m);
    });
    this.client.on("message/updated", (message, event) => {
      if (!this.observedReactions.has(message._id)) return;
      if (event.user_id == this.client.user._id) return;
      if (!["MessageReact", "MessageUnreact"].includes(event.type)) return; // only reactions
      const observer = this.observedReactions.get(message._id);
      if (!observer.r.includes(event.emoji_id)) return;
      observer.cb(event, message);
    });

    console.log("Loading command files...");
    this.handler = new CommandHandler(this.client, config.prefix);
    this.handler.setReplyHandler((t, msg) => {
      msg.reply(this.em(t, msg), false);
    });
    this.handler.addOwners(...(this.config.owners || ["01G9MCW5KZFKT2CRAD3G3B9JN5"]));
    this.handler.setRequestCallback((...data) => this.request(...data));
    this.handler.setOnPing(msg => {
      let pref = this.handler.getPrefix(msg.channel.server_id);
      let m = this.iconem(msg.channel.server.name, "My prefix in this server is: `" + pref + "`", (msg.channel.server.icon) ? "https://autumn.revolt.chat/icons/" + msg.channel.server.icon._id : null, msg);
      msg.reply(m, false)
    });
    this.handler.setPaginationHandler((message, form, contents) => {
      this.pagination(form, contents, message, 4);
    });
    this.handler.enableHelpPagination(true);
    const dir = path.join(__dirname, "commands");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    this.runnables = new Map();

    // load command files
    files.forEach(commandFile => {
      const file = path.join(dir, commandFile);
      const cData = require(file);
      const builder = (typeof cData.command == "function") ? cData.command.call(this) : cData.command;
      if (cData.export) this[cData.export.name] = cData.export.object;
      this.handler.addCommand(builder);
      if (cData.run) {
        this.runnables.set(builder.uid, cData.run);
        builder.subcommands.forEach(sub => {
          this.runnables.set(sub.uid, cData.run);
        });
      }
    });
    this.handler.on("run", (data) => {
      if (this.runnables.has(data.command.uid)) {
        this.runnables.get(data.command.uid).call(this, data.message, data);
      }
    });
    console.log("Done!\n");

    if (process.argv[2] == "usage") {
      fs.writeFile("cmdUsage.md", this.handler.generateCommandOverviewMD(),()=>{ console.log("Done!"); process.exit(1) });
    } else if (process.argv[2] == "sreload") {
      this.settingsMgr.syncDefaults(); // updates all guilds if they are missing defaults
      this.settingsMgr.save();
    }

    this.revoice = new Revoice(config.token || config.login);

    try {
      this.comHash = require('child_process')
          .execSync('git rev-parse --short HEAD', {cwd: __dirname})
          .toString().trim();
      this.comHashLong = require('child_process')
          .execSync('git rev-parse HEAD', {cwd: __dirname})
          .toString().trim();
    } catch(e) {
      console.log("Git comhash error");
      this.comHash = "Newest";
      this.comHashLong = null;
    }

    this.comLink = (this.comHashLong) ? "https://github.com/remix-bot/revolt/tree/" + this.comHashLong : "https://github.com/remix-bot/revolt";
    this.playerMap = new Map();
    this.currPort = -1;
    this.channels = [];
    this.freed = [];

    if (config.token) {
      this.client.loginBot(config.token);
    } else {
      this.client.login(config.login);
    }

    Object.defineProperty(this.client, "allServers", {
      get: function() {
        var servers = [];
        var iterator = this.servers.entries();
        for (let v = iterator.next(); !v.done; v = iterator.next()) {
          servers.push(v.value[1]);
        };
        return servers
      }
    });

    return this;
  }
  async fetchUsers() {
    const promises = [];
    for (const server of this.client.servers) {
      promises.push(server[1].fetchMembers());
    }

    await Promise.allSettled(promises);
    console.log(this.client.users.size);
  }
  request(d) {
    switch(d.type) {
      case "prefix":
        return this.settingsMgr.getServer(d.data.channel.server_id).get("prefix");
    }
  }
  getPlayer(message, promptJoin=true) {
    var askVC = (msg) => {
      return new Promise(res => {
        msg.reply(this.em("Please send the voice channel! (Mention/Id/Name)\nSend 'x' to cancel.", msg), false);
        const join = (msg) => {
          const observer = this.observeUser(msg.author_id, msg.channel._id, (m) => {
            if (m.content.toLowerCase() == "x") {
              this.unobserveUser(observer);
              m.reply(this.em("Cancelled!", m), false);
              return res(false);
            }
            if (!this.handler.validateString(m.content, m, "voiceChannel")) return m.reply(this.em("Invalid channel. Please try again and check capitalisation! (`x` to cancel)", m), false);
            const channel = this.handler.formatString(m.content, m, "voiceChannel");
            this.unobserveUser(observer);
            this.joinChannel(m, channel, () => {
              res(channel);
            }, () => { join(msg); });
          });
        }
        join(msg);
      });
    }
    return new Promise(async res => {
      const user = this.revoice.getUser(message.author_id).user;
      var cid = (user) ? user.connectedTo : null;
      if (!user || !cid) {
        if (!promptJoin) {
          message.reply(this.em("It doesn't look like we're in the same voice channel.", message), false);
          return res(false);
        }
        var success = await askVC(message);
        if (!success) return res(null);
        cid = success;
      }
      return res(this.playerMap.get(cid));
    });
  }
  getSettings(message) {
    const serverId = message.channel.server_id;
    return this.settingsMgr.getServer(serverId);
  }
  observeUser(id, channel, cb) {
    this.observedUsers.set(id + ";" + channel, cb);
    return id + ";" + channel;
  }
  unobserveUser(i) {
    return this.observedUsers.delete(i);
  }
  observeReactions(msg, reactions, cb) {
    this.observedReactions.set(msg._id, { r: reactions, cb });
    return msg._id;
  }
  unobserveReactions(i) {
    return this.observedReactions.delete(i);
  }

  paginate(text, maxLinesPerPage=5, page=0) {
    page -= 1;
    const lines = text.split("\n");
    return lines.slice(maxLinesPerPage * page, maxLinesPerPage * page + maxLinesPerPage);
  }
  pages(text, maxLinesPerPage=2) {
    const lines = (Array.isArray(text)) ? text : text.split("\n");
    const pages = [];
    for (let i = 0, n = 0; i < lines.length; i++, (i % maxLinesPerPage == 0) ? n++ : n) {
      let line = lines[i];
      if (!pages[n]) pages[n] = [];
      pages[n].push(line);
    }
    return pages;
  }
  pagination(form, content, message, maxLinesPerPage=2) {
    if (!message.channel.server.member.hasPermission(message.channel, "React")) return message.reply({ content: " ", embeds: [this.embedify("I need reaction permissions to work. Please contact a server administrator to address this.")] }, true);
    const arrows = [ "⬅️", "➡️" ];
    var page = 0;
    const paginated = this.pages(content, maxLinesPerPage);
    form = form.replace(/\$maxPage/gi, paginated.length);

    var lastEmbed;
    var messageFormatter = (t) => {
      lastEmbed = this.embedify(form.replace(/\$currPage/gi, page + 1).replace(/\$content/gi, t));
      return {
        embeds: [
          lastEmbed
        ]
      }
    }

    message.reply({
      content: " ",
      ...messageFormatter(paginated[0].join("\n")),
      interactions: {
        restrict_reactions: true,
        reactions: arrows
      }
    }, false).then(m => {
      const oid = this.observeReactions(m, arrows, (e, ms) => {
        let change = (e.emoji_id == arrows[0]) ? -1 : 1;
        if (page + change < 0) page = paginated.length - 1, change = 0;
        if (!paginated[page + change]) page = 0, change = 0;
        page += change;
        const c = paginated[page].join("\n");
        ms.edit(messageFormatter(c));
        clearTimeout(currTime);
        currTime = setTimeout(() => { finish() }, 60*1000);
      });
      const finish = () => {
        this.unobserveReactions(oid);
        m.edit({
          content: "Session Closed",
          embeds: [
            this.embedify(lastEmbed.description + "\nSession closed - Changing pages **won't work** from here.", "red")
          ]
        });
      }
      var currTime = setTimeout(() => { finish() }, 60*1000);
    })
  }

  embedify(text = "", color = "#e9196c") {
    return {
      type: "Text",
      description: "" + text, // convert bools and numbers to strings
      colour: color,
    }
  }
  masquerade(msg) {
    let a = this.settingsMgr.getServer(msg.channel.server_id).get("pfp");
    let avatar = null;
    if (a == "dark") {
      avatar = "https://autumn.revolt.chat/avatars/xkTqA-n4CDX6_DIwaQJSIy2B1mYpBQRH0iM2dyIscR";
    } else if (a == "light") {
      avatar = "https://autumn.revolt.chat/attachments/R8H83bujBVaWxRZr1AYtFX7PEW27CVw3_zaynkwqNq/light-remix2.jpeg";
    } else if (a == "mono") {
      avatar = "https://autumn.revolt.chat/attachments/3Pxsbb6mhD_d9pxxrd0osbWKmI5kat0hg4fq4EUJGK/light-remix.jpeg";
    } else if (a != "default") {
      avatar = a;
    }
    return (avatar) ? {
      name: "Remix",
      avatar: avatar
    } : null;
  }
  em(text, msg) { // embedMessage
    return {
      content: " ",
      embeds: [this.embedify(text)],
      masquerade: this.masquerade(msg)
    }
  }
  iconem(title, text, img, m) {
    let e = this.embedify(text);
    e.icon_url = img;
    e.title = title;
    return {
      content: " ",
      embeds: [e],
      masquerade: this.masquerade(m)
    }
  }
  isNumber(n) {
    return !isNaN(n) && !isNaN(parseFloat(n));
  }
  prettifyMS(milliseconds) {
    const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

  	const parsed = {
  		days: roundTowardsZero(milliseconds / 86400000),
  		hours: roundTowardsZero(milliseconds / 3600000) % 24,
  		minutes: roundTowardsZero(milliseconds / 60000) % 60,
  		seconds: roundTowardsZero(milliseconds / 1000) % 60,
  		milliseconds: roundTowardsZero(milliseconds) % 1000,
  		microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
  		nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000
  	};

    const units = {
      days: "d",
      hours: "h",
      minutes: "m",
      seconds: "s"
    }

    var result = "";
    for (let k in parsed) {
      if (!parsed[k] || !units[k]) continue;
      result += " " + parsed[k] + units[k];
    }
    return result.trim();
  }
}

new Remix();

// God, please forgive us, this is just to keep the bot online at all cost
process.on("unhandledRejection", (reason, p) => {
  console.log(" [Error_Handling] :: Unhandled Rejection/Catch");
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(" [Error_Handling] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
