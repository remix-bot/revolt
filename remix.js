// TODO: rename to index.js
const { CommandHandler } = require("./Commands.js");
const { Revoice } = require("revoice.js");
const { Client } = require("revolt.js");
const path = require("path");
const fs = require("fs");

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

    this.client.on("ready", () => {
      this.client.users.edit({
        status: {
          text: "%help | by RedTech/NoLogicAlan",
          presence: "Online"
        },
      });
      console.log("Logged in as " + this.client.user.username);
    });

    this.handler = new CommandHandler(this.client);
    this.handler.setReplyHandler((t, msg) => {
      msg.reply({ content: "", embeds: [{
          type: "Text",
          description: t,
          colour: "#e9196c",
        }
      ]})
    });
    const dir = path.join(__dirname, "commands");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    this.runnables = new Map();

    // load command files
    files.forEach(commandFile => {
      const file = path.join(dir, commandFile);
      const cData = require(file);
      const builder = cData.command;
      this.handler.addCommand(builder);
      if (cData.run) {
        this.runnables.set(builder.uid, cData.run);
      }
    });
    this.handler.on("run", (data) => {
      if (this.runnables.has(data.command.uid)) {
        this.runnables.get(data.command.uid).call(this, data.message, data);
      }
    });

    this.revoice = new Revoice(config.token);

    this.playerMap = new Map();
    this.currPort = -1;
    this.channels = [];
    this.freed = [];

    this.client.loginBot(config.token);

    return this;
  }
  getPlayer(message) {
    const user = this.revoice.getUser(message.author_id).user;
    if (!user) { message.reply(this.em("It doesn't look like we're in the same voice channel.")); return false }
    const cid = user.connectedTo;
    if (!cid) return false;
    return this.playerMap.get(cid);
  }
  embedify(text = "", color = "#e9196c") {
    return {
      type: "Text",
      description: text,
      colour: color,
    }
  }
  em(text) { // embedMessage
    return {
      content: " ",
      embeds: [this.embedify(text)],
    }
  }
}

const remix = new Remix();
/*
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

const handler = new CommandHandler(client);
handler.setReplyHandler((t, msg) => {
  msg.reply({ content: "", embeds: [{
      type: "Text",
      description: t,
      colour: "#e9196c",
    }
  ]})
});
const dir = path.join(__dirname, "commands");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
const runnables = new Map();

// load command files
files.forEach(commandFile => {
  const file = path.join(dir, commandFile);
  const cData = require(file);
  const builder = cData.command;
  handler.addCommand(builder);
  if (cData.run) {
    runnables.set(builder.uid, cData.run);
  }
});
handler.on("run", (data) => {
  if (runnables.has(data.command.uid)) {
    runnables.get(data.command.uid).call(this, data.message);
  }
});

const revoice = new Revoice(config.token);

const player = new Map();
var currPort = -1;
const channels = [];
const freed = [];

client.loginBot(config.token);*/

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
  // console.log(" [Error_Handling] :: Uncaught Exception/Catch (MONITOR)");
  // console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  // console.log(" [Error_Handling] :: Multiple Resolves");
  // console.log(type, promise, reason);
});
