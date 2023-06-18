const { CommandHandler } = require("./Commands.js");
const Uploader = require("revolt-uploader");
const { Revoice } = require("revoice.js");
const { Client } = require("revolt.js");
const path = require("path");
const fs = require("fs");
const { SettingsManager } = require("./settings/Settings.js");
if (!process.execArgv.includes("--inspect")) require('console-stamp')(console, 'HH:MM:ss.l');

const Genius = require("genius-lyrics");
const Spotify = require('spotifydl-core').default;

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
    this.client = new Client(config["revolt.js"]);
    this.client.config = config;
    this.config = config;
    this.modules = require("./storage/modules.json");
    this.spotifyConfig = config.spotify;
    this.announceSong = config.songAnnouncements;
    this.presenceInterval = config.presenceInterval || 7000;

    this.memberMap = new Map();

    this.observedUsers = new Map();
    this.observedReactions = new Map();

    this.settingsMgr = new SettingsManager();
    this.settingsMgr.loadDefaultsSync("./storage/defaults.json");

    this.uploader = new Uploader(this.client);

    this.geniusClient = new Genius.Client(this.config.geniusToken);
    this.spotify = new Spotify(this.spotifyConfig)

    this.i18n = require("i18next");
    this.i18n.use(require("i18next-fs-backend")).init({
      fallbackLng: "en",
      initImmediate: false,
      backend: {
        loadPath: path.join(__dirname, "/storage/locales/{{ns}}/{{lng}}.json"),
        addPath: '/locales/{{ns}}/{{lng}}.missing.json'
      },
      nonExplicitSupportedLngs: true,
      supportedLngs: ["en", "de", "de-DE", "sk-SK", "ar", "ar-SA"],
      preload: ["en", "de-DE", "ar-SA"],
      ns: "bot",
    }).then(() => {
      console.log("localisation loaded");
    });

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
      this.mapMembers().then(() => {
        let state = 0;
        let def = ["Ping for prefix", "By RedTech | NoLogicAlan", "Servers: $serverCount"];
        let texts = config.presenceContents || def;
        if (texts.length == 0) texts = def;
        setInterval(() => {
          this.client.user.edit({
            status: {
              text: texts[state].replace(/\$serverCount/g, this.client.servers.size()),
              presence: "Online"
            },
          });
          if (state == texts.length - 1) {state = 0} else {state++}
        }, this.presenceInterval);
      });

      if (!this.config.fetchUsers) return;
      this.fetchUsers();
      setInterval(() => this.fetchUsers, 60 * 1000 * 30);
    });
    this.client.on("messageCreate", (m) => {
      if (!this.observedUsers.has(m.authorId + ";" + m.channelId)) return;
      this.observedUsers.get(m.authorId + ";" + m.channelId)(m);
    });
    const reactionUpdate = (message, user, emoji) => {
      const event = { user_id: user, emoji_id: emoji };
      if (!this.observedReactions.has(message.id)) return;
      if (event.user_id == this.client.user.id) return;
      const observer = this.observedReactions.get(message.id);
      if (!observer.r.includes(event.emoji_id)) return;
      if (observer.user) if (observer.user != user) return;
      observer.cb(event, message);
    }
    this.client.on("messageReactionAdd", reactionUpdate);
    this.client.on("messageReactionRemove", reactionUpdate);
    this.client.on("serverMemberJoin", (member) => { // TODO: test
      const data = this.memberMap.get(member.server.id);
      if (!data) return;
      data.push(member.id.user);
      this.memberMap.set(member.server.id, data);
    });
    this.client.on("serverMemberLeave", (member) => {
      const data = this.memberMap.get(member.id.server);
      if (!data) return;
      const idx = data.findIndex(e => e == member.id.user);
      if (idx == -1) return;
      data.splice(idx, 1);
      this.memberMap.set(member.id.server, data);
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
      let m = this.iconem(msg.channel.server.name, this.t("commands.ping", msg, {prefix: "`" + pref + "`"}), (msg.channel.server.icon) ? "https://autumn.revolt.chat/icons/" + msg.channel.server.icon._id : null, msg);
      msg.reply(m, false)
    });
    this.handler.setPaginationHandler((message, form, contents) => {
      this.pagination(form, contents, message, 8);
    });
    this.handler.enableHelpPagination(true);
    const dir = path.join(__dirname, "commands");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    this.runnables = new Map();
    this.commandFiles = new Map();

    // load command files
    files.forEach(commandFile => {
      const file = path.join(dir, commandFile);
      const cData = require(file);
      const builder = (typeof cData.command == "function") ? cData.command.call(this) : cData.command;
      if (cData.export) this[cData.export.name] = cData.export.object;
      this.handler.addCommand(builder);
      this.commandFiles.set(builder.uid, file);
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

    this.revoice = new Revoice(config.token || config.login, config["revolt-api"]);
    this.observedVoiceUsers = new Map();

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
  static sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
  async fetchUsers() {
    const promises = [];
    for (const server of this.client.servers) {
      promises.push(server[1].fetchMembers());
    }

    await Promise.allSettled(promises);
    console.log(this.client.users.size);
  }
  mapMembers() {
    return new Promise(async res => {
      if (!this.config.mapMembers) return res();
      const evaluate = (data) => {
        data = data.map(v => v.value);
        data.forEach(members => {
          if (!members) return;
          members = members.members;
          const server = members[0].server.id;
          members = members.map(m => m.id.user);
          this.memberMap.set(server, members);
        });
      }

      const promises = [];
      const servers = this.client.allServers;
      console.log("Started mapping server members");
      for (let i = 0; i < servers.length; i++) {
        if (i % 30 === 0 && i !== 0) {
          evaluate(await Promise.allSettled(promises));
          console.log("Mapped " + Math.round((i / servers.length * 100)) + "%")
          promises.length = 0;
          await Remix.sleep(1000);
        }
        promises.push(servers[i].fetchMembers());
      }
      if (promises.length !== 0) evaluate(await Promise.allSettled(promises));
      console.log("Finished mapping server members!");
      res();
    });
  }
  mutualServers(user) {
    const iterator = this.memberMap.entries();
    const mutual = [];
    for (let v = iterator.next(); !v.done; v = iterator.next()) {
      if (v.value[1].includes(user)) mutual.push(v.value[0]);
    }
    return mutual;
  }
  getSharedServers(user) {
    var servers = this.mutualServers(user.id).map(s => this.client.servers.get(s));
    servers = servers.map((server) => {
      return {
        name: server.name,
        id: server.id,
        icon: server.animatedIconURL || server.iconURL || null,
        voiceChannels: server.channels.filter(c => c.type == "VoiceChannel").map(c => ({ name: c.name, id: c.id, icon: c.animatedIconURL || c.iconURL || null })) // TODO: fetch users as well
      }
    });
    return servers;
  }
  getVoiceData(server) {
    return new Promise(async res => {
      server = this.client.servers.get(server);
      if (!server) return res(false);
      const channels = server.channels.filter(c => c.type == "VoiceChannel")
      res(channels.map(c => {
        const con = this.revoice.getVoiceConnection(c.id);
        const data = {
          name: c.name,
          id: c.id,
          users: (con || { users: [] }).users
        }
        data.users = data.users.map(u => this.client.users.get(u.id) || u).map(u => ({ name: u.username, id: u.id, avatar: u.avatarURL }))
        return data;
      }));
    });
  }
  request(d) {
    switch(d.type) {
      case "prefix":
        return this.settingsMgr.getServer(d.data.channel.serverId).get("prefix");
    }
  }
  getPlayer(message, promptJoin=true, verifyUser=true) {
    var askVC = (msg) => {
      return new Promise(res => {
        const channels = [];
        if (msg.channel.type === "Group") {
          return this.joinChannel(msg, msg.channel.id, (p) => {
            p.once("roomfetched", () => { // TODO: implement this in %join
              if (p.connection.users.find(u => u.id == msg.authorId)) return;
              msg.reply(this.em("You don't seem to be connected to <#" + msg.channel.id + ">. Did you forget to join?", msg), true);
            });
            res(msg.channel.id);
          }, () => { m.edit(this.em("Something went wrong. Unable to join <#" + msg.channel.id + ">. Do I have the needed permission?", m)); return res(false); });
        }
        var iterator = msg.channel.server.channels.entries();
        for (let v = iterator.next(); !v.done; v = iterator.next()) {
          if (v.value[1].type != "VoiceChannel") continue;
          channels.push(v.value[1]);
        }
        if (channels.length != 0) { // TODO: translate
          var channelSelection = "Please select one of the following channels by clicking on the reactions below\n\n";
          var reactions = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];//[":one:",":two:",":three:",":four:",":five:",":six:",":seven:",":eight:",":nine:"];
          channels.slice(0, 9).forEach((c, i) => {
            channelSelection += (i + 1) + ". <#" + c.id + ">\n";
          });
        }
        const mObj = this.em(((channelSelection) ? channelSelection + "\n**..or**" : "Please") + " send a message with the voice channel! (Mention/Id/Name)\nSend 'x' to cancel.", msg);
        if (channels.length != 0) {
          mObj.interactions = {
            restrict_reactions: true,
            reactions: reactions.slice(0, Math.min(channels.length, 9))
          }
        }
        var roid;
        var observer;
        msg.reply(mObj, false).then(m => {
          roid = this.observeReactions(m, reactions, (e) => {
            const idx = reactions.findIndex(r => r == e.emoji_id);
            const c = channels[idx];
            this.joinChannel(msg, c.id, (p) => {
              p.once("roomfetched", () => { // TODO: implement this in %join
                if (p.connection.users.find(u => u.id == msg.authorId)) return;
                msg.reply(this.em(this.t("voice.join.warning.nc", m, {channel: "<#" + c.id + ">"}), msg), true);
              });
              res(c.id);
            }, () => { m.edit(this.em("Something went wrong. Unable to join <#" + c.id + ">. Do I have the needed permission?", m)); return res(false); });

            this.unobserveUser(observer);
            this.unobserveReactions(roid);
          }, msg.author);
        });
        const join = (msg) => {
          observer = this.observeUser(msg.authorId, msg.channelId, (m) => {
            if (m.content.toLowerCase() == "x") {
              this.unobserveUser(observer);
              this.unobserveReactions(roid);
              m.reply(this.em(this.t("voice.join.cancelled", m), m), false);
              return res(false);
            }
            if (!this.handler.validateString(m.content, m, "voiceChannel")) return m.reply(this.em(this.t("voice.join.error.invalid", m), m), false); // TODO: more specific error messages
            const channel = this.handler.formatString(m.content, m, "voiceChannel");
            this.unobserveUser(observer);
            this.unobserveReactions(roid);
            this.joinChannel(m, channel, () => {
              res(channel);
            }, () => { join(msg); });
          });
        }
        join(msg);
      });
    }
    return new Promise(async res => {
      const user = this.revoice.getUser(message.authorId).user;
      var cid = (user) ? user.connectedTo : null;
      if (message.channel.type === "Group") cid = message.channel.id;
      var player = this.playerMap.get(cid);
      if (!((verifyUser) ? user : true) || !cid || !player) {
        if (!promptJoin) {
          message.reply(this.em("It doesn't look like we're in the same voice channel.", message), false);
          return res(false);
        }
        var success = await askVC(message);
        if (!success) return res(null);
        cid = success;
      }
      player = this.playerMap.get(cid);
      return res(player);
    });
  }
  observeUserVoice(user, cb) {
    const cid = Math.random();
    const arr = (this.observedVoiceUsers.get(user) || []);
    arr.push({ cid, cb});
    this.observedVoiceUsers.set(user, arr);
    return user + ";" + cid;
  }
  unobserveUserVoice(i) {
    const user = i.split(";")[0];
    const cid = i.split(";")[1];
    if (!this.observedVoiceUsers.has(user)) return;
    const a = this.observedVoiceUsers.get(user);
    const idx = a.findIndex(e => e.cid == cid);
    if (idx == -1) return;
    a.splice(idx, 1);
    if (a.length == 0) return this.observedVoiceUsers.delete(user);
    this.observedVoiceUsers.set(user, a);
  }
  t(key, language, options) {
    if (typeof language === "object") {
      const settings = this.getSettings(language);
      language = settings.get("locale");
    }
    return this.i18n.t(key, { ...options, lng: language });
  }
  getSettings(message) {
    const serverId = message.channel.serverId;
    return this.settingsMgr.getServer(serverId);
  }
  observeUser(id, channel, cb) {
    this.observedUsers.set(id + ";" + channel, cb);
    return id + ";" + channel;
  }
  unobserveUser(i) {
    return this.observedUsers.delete(i);
  }
  observeReactions(msg, reactions, cb, user) {
    this.observedReactions.set(msg.id, { r: reactions, user: (user) ? user.id : null, cb });
    return msg.id;
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
    if (!message.channel.havePermission("React")) {
      if (!message.channel.havePermission("SendMessage")) return message.member.user.openDM().then(dm => {
        dm.sendMessage({ content: " ", embeds: [this.embedify("I am unable to send messages in <#" + message.channelId + ">. Please contact a server administrator and grant me the \"SendMessage\" permission.")]})
      }).catch(() => {});
      return message.reply({ content: " ", embeds: [this.embedify("I need reaction permissions to work. Please contact a server administrator to address this.")] }, true);
    }
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

/*const { ShardingManager } = require("revolt.js"); // reshard.js :eyes:
const mgr = new ShardingManager({ scriptPath: "./bot.js", shardServerCount: 3 });
mgr.loginBot(config.token);*/

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
