const RevoltPlayer = require("./RevoltPlayer.js");
const { Revoice } = require("revoice.js");
const { Client } = require("revolt.js");
const fs = require('fs');
const EventEmitter = require("events");

let config;
if (fs.existsSync("./config.json")) {
  config = require("./config.json");
} else {
  config = {
    token: process.env.TOKEN
  };
}

const client = new Client();
client.config = config;

client.on("ready", () => {
  client.users.edit({
    status: {
      text: "%help | by RedTech/NoLogicAlan",
      presence: "Online"
    },
  });
  console.log("Logged in as " + client.user.username);
});

class CommandHandler {
  constructor(client, prefix = "!", errors) {
    this.client = client;
    this.errors = errors;
    client.on("message", (message) => {
      if (!message || !message.content) return;
      if (!message.content.startsWith(this.prefix)) return; // not a command
      const args = message.content
        .slice(this.prefix.length)
        .trim()
        .split(" ")
        .map((el) => el.trim());
      if (!this.commandNames.includes(args[0].toLowerCase())) return; // not a known comamnd
      const command = this.commands.find((el) => {
        return el.command === args[0].toLowerCase();
      });
      if (!command) throw "Something really broke here; CommandHandler; onMessage";
      const wrongUsageMsg =
        typeof errors[command.command] === "function"
          ? errors[command.command]
          : (msg, prefix) => {
            msg.reply(errors[command.command].replace(/{%p}/g, prefix));
          };
      command.callback({
        message: message,
        arguments: args,
        wrongUsage: () => {
          wrongUsageMsg(message, this.prefix);
        },
      });
    });

    this.prefix = prefix;
    this.commandNames = [];
    this.commands = [];

    this.events = new EventEmitter();

    return this;
  }
  addCommand(command, cb) {
    this.commandNames.push(command);
    return this.commands.push({ command: command, callback: cb });
  }
}
const errors = {
  join: "Usage: {%p}join <channel-id>",
  play: "Usage: {%p}play <yt-query/link>",
  remove: "Usage: {%p}remove <queue-index>",
  loop: "Usage: {%p}loop [song/queue]",
};
const commands = new CommandHandler(client, "%", errors);
const revoice = new Revoice(config.token);

const player = new Map();
var currPort = -1;
const channels = [];
const freed = [];

function getPlayer(data) {
  const user = revoice.getUser(data.message.author_id).user;
  if (!user) { data.message.reply("It doesn't look like we're in the same voice channel."); return false }
  const cid = user.connectedTo;
  if (!cid) return false;
  return player.get(cid);
}

function embedify(text = "", color = "#e9196c") {
  return [
    {
      type: "Text",
      description: text,
      colour: color,
    },
  ]
}

commands.addCommand("help", (data, message) => {
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(`### Music Commands\n\`join\`, \`play\`, \`pause\`, \`resume\`, \`skip\`, \`leave\`, \`np\`,\`remove\`, \`list\`, \`clear\`, \`shuffle\`, \`loop\`\n### Misc Command\n\`help\`, \`stats\``),
  });
});
commands.addCommand("stats", (data, message) => {
  const prettyMilliseconds = require("pretty-ms");
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(`__**Stats:**__\n\n⌚️ Uptime: \`${prettyMilliseconds(Math.round(process.uptime()) * 1000)}\`\n:open_file_folder: Server Count: \`${client.servers.size}\`\n:mega: Player Count: \`${revoice.connections.size}\`\n🏓 Ping: \`${client.websocket.ping}ms\``),
  });
});
commands.addCommand("join", (data) => {
  const cid = data.arguments[1];
  if (!data.message.channel.server.channels.some(c => c._id === cid)) {
    return data.message.reply("Couldn't find the channel `" + cid + "` in this server.\ntry to use `%join <channel-id>`");
  }
  if (player.has(cid)) {
    return data.message.reply("Already joined. <#" + cid + ">");
  }
  channels.push(cid);
  const pOff = freed.shift() || ++currPort; // reuse old ports
  const p = new RevoltPlayer(config.token, config.yt, {
    voice: revoice,
    portOffset: pOff,
  });
  p.on("autoleave", async () => {
    //data.message.channel.sendMessage("Left the channel <#" + cid + "> because of inactivity.");
    data.message.channel.sendMessage({
      content: " ",
      embeds: embedify("Left the channel <#" + cid + "> because of inactivity."),
    });
    const port = p.port - 3050;
    player.delete(cid);
    p.destroy();
    freed.push(port);
  });
  player.set(cid, p);
  data.message.reply("Joining Channel...").then((message) => {
    p.join(cid).then(() => {
      message.edit({
        content: " ",
        embeds: embedify(`:white_check_mark: I Successfully Joined <#${cid}>`),
      });
    });
  });
});
commands.addCommand("play", (data) => {
  const p = getPlayer(data);
  if (!p) return data.wrongUsage();
  const query = data.arguments.slice(1).join(" "); // get the full query string
  if (!query) return data.wrongUsage();
  data.message.reply("Searching...").then((msg) => {
    const messages = p.play(query);
    messages.on("data", (data) => {
      msg.edit({
        content: " ",
        embeds: embedify(data),
      });
    });
  });
});
commands.addCommand("pause", (data) => {
  const p = getPlayer(data);
  p.pause();
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(`:white_check_mark: The song has been paused!`),
  });
});
commands.addCommand("resume", (data) => {
  const p = getPlayer(data);
  p.resume();
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(`:white_check_mark: The song has been resumed!`),
  });
});
commands.addCommand("skip", (data) => {
  const p = getPlayer(data);
  p.skip();
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(`:white_check_mark: The song has been skipped!`),
  });
});
commands.addCommand("leave", async (data) => {
  const user = revoice.getUser(data.message.author_id).user;
  if (!user) { data.message.reply("It doesn't look like we're in the same voice channel."); return false }
  const cid = user.connectedTo;
  if (!cid) return data.message.reply("It doesn't look like you're in a voice channel.");
  if (!player.has(cid)) return data.message.reply("I haven't joined yet!");
  const p = player.get(cid);
  player.delete(cid);
  const port = p.port - 3050;
  const msg = await data.message.reply("Leaving...")
  const left = p.leave();
  //p.leave().then(async left => {
  p.destroy(); // wait for the ports to be open again
  freed.push(port);
  msg.edit({
    content: " ",
    embeds: embedify(((left) ? `:white_check_mark: I Successfully Left` : `Not connected to any voice channel`)),
  })
  //});
});
commands.addCommand("np", (data) => {
  const p = getPlayer(data);
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(p.nowPlaying()),
  });
});
commands.addCommand("list", (data) => {
  const p = getPlayer(data);
  const messages = p.list();
  data.message.reply(messages[0]).then(() => {
    messages.slice(1).forEach((msg) => {
      data.message.channel.sendMessage(msg);
    });
  });
});
commands.addCommand("clear", (data) => {
  const p = getPlayer(data);
  p.clear();
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(`:white_check_mark: Queue cleared.`),
  });
});
commands.addCommand("shuffle", (data) => {
  const p = getPlayer(data);
  const shuffled = p.shuffle();
  if (typeof shuffled == "string") {
    data.message.reply(shuffled);
  } else {
    data.message.channel.sendMessage({
      content: " ",
      embeds: embedify(`:white_check_mark: Shuffled the queue.`),
    });
  }
});
commands.addCommand("remove", (data) => {
  const p = getPlayer(data);
  const index = data.arguments[1];
  if (isNaN(parseInt(index))) {
    data.message.reply("`" + index + "` is not a number!");
  } else {
    const removed = p.remove(parseInt(index));
    data.message.channel.sendMessage({
      content: " ",
      embeds: embedify(removed),
    });
  }
});
commands.addCommand("loop", (data) => {
  const p = getPlayer(data);
  if (!p) return data.wrongUsage();
  const loop = p.loop(data.arguments[2]);
  data.message.channel.sendMessage({
    content: " ",
    embeds: embedify(loop),
  });
});

client.loginBot(config.token);

process.on("unhandledRejection", (reason, p) => {
  // console.log(" [Error_Handling] :: Unhandled Rejection/Catch");
  // console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  // console.log(" [Error_Handling] :: Uncaught Exception/Catch");
  // console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  // console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
  // console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  // console.log(" [Error_Handling] :: Multiple Resolves");
  // console.log(type, promise, reason);
});