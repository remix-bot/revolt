const EventEmitter = require("events");

class CommandBuilder extends EventEmitter {
  constructor() {
    super();

    this.name = null;
    this.description = null;
    this.subcommands = [];
    this.options = [];

    this.subcommandError = "Invalid subcommand. Try one of the following options: `$previousCmd <$cmdlist>`";

    return this;
  }
  setName(n) {
    this.name = n;
    return this;
  }
  setDescription(d) {
    this.description = d;
    return this;
  }
  addSubcommand(config) {
    this.subcommands.push(config(new CommandBuilder()));//new SubcommandBuilder()));
    return this;
  }
  addStringOption(config) {
    this.options.push(config(new Option("string")))
    return this;
  }
  addNumberOption(config) {
    this.options.push(config(new Option("number")));
    return this;
  }
  addBooleanOption(config) {
    this.options.push(config(new Option("boolean")));
    return this;
  }
  addChannelOption(config) {
    this.options.push(config(new Option("channel")));
    return this;
  }
}

/*class SubcommandBuilder extends CommandBuilder {
  constructor() {
    super();
  }
  addSubcommand() {
    console.warn("Unsupported.");
    // TODO: consider allowing it and just use a CommandBuilder class
  }
}*/
class Option {
  constructor(type="string") {
    this.name = null;
    this.description = null;

    this.type = type;

    return this;
  }
  setName(n) {
    this.name = n;
    return this;
  }
  setDescription(d) {
    this.description = d;
    return this;
  }

  validateInput(i) {
    switch(this.type) {
      case "string":
        return true;
      case "number":
        return !isNaN(i) && !isNaN(parseFloat(i));
      case "boolean":
        return (
          i == "0" ||
          i == "1" ||
          i.toLowerCase() == "true" ||
          i.toLowerCase() == "false"
        );
      case "user": // TODO: Add user validation
      case "channel":
        // check if string is empty
        return !!i; // TODO: Add channel validation
      // TODO: Add roles
    }
  }
}

class CommandHandler extends EventEmitter {
  constructor(client, prefix="!") {
    super();

    this.client = client;
    this.prefix = prefix;
    this.acceptCommand = "a";
    this.commandNames = [];
    this.commands = [];

    this.fixMap = new Map(); // typo corrections

    this.minMatchScore = 0.75;
    this.replyHandler = (t, msg) => {
      msg.reply(t);
    }

    this.client.on("message", (msg)=>this.messageHandler(msg))

    return this;
  }
  messageHandler(msg) {
    if (!msg || !msg.content) return;
    if (!msg.content.startsWith(this.prefix)) return;
    const args = msg.content
      .slice(this.prefix.length)
      .trim()
      .split(" ")
      .map((el) => el.trim())
    if (args[0] === this.acceptCommand && this.fixMap.has(msg.author_id)) {
      let cmd = this.fixMap.get(msg.author_id);
      this.fixMap.delete(msg.author_id);
      return this.processCommand(cmd, msg);
    }
    if (!this.commandNames.includes(args[0].toLowerCase())) {
      // unknown command; try to find a similar command
      const matches = this.commandNames.map(c => {
        return {
          score: this.calcMatch(args[0], c),
          command: c
        }
      });
      matches.sort((a,b) => b.score-a.score);
      console.log(matches)
      if (matches[0].score < this.minMatchScore) return; // unknown command, not similar to existing one

      // match found, suggest to user
      // TODO: implement suggestions
      let cmd = this.commands.find(e => e.name == matches[0].command);
      this.fixMap.set(msg.author_id, cmd, args.slice(1));

      let fixed = matches[0].command + " " + args.slice(1).join(" ");
      this.replyHandler(this.f("Did you mean `$prefix" + fixed + "`? (Type `$prefix$accept` to run this)"), msg);
      return;
    }
    return this.processCommand(this.commands.find(e => e.name == args[0].toLowerCase()), args, msg);
  }
  calcMatch(word, base, insensitive=true) {
    insensitive = (insensitive) ? "i" : "";
    let matching = 0;
    let used = [];
    word.split("").forEach(c => {
      if (used.includes(c)) return;
      let m = base.match(new RegExp(c, "g" + insensitive));
      used.push(c);
      if (m === null) return;
      matching += m.length;
    });
    return matching / base.length;
  }
  setReplyHandler(reply) {
    this.replyHandler = reply;
  }
  setAcceptCommand(c) {
    this.acceptCommand = c;
    return this.acceptCommand;
  }

  f(text) { // text format function
    text = text.replace(/\$prefix/gi, this.prefix);
    text = text.replace(/\$accept/gi, this.acceptCommand);
    return text;
  }
  processCommand(cmd, args, msg, previous=false) {
    if (previous === false) previous = this.f("$prefix" + cmd.name);
    if (!cmd) return console.warn("Something sus is going on... [CommandHandler.processCommand]");
    this.emit("command", { command: cmd, message: msg });
    // process subcommands first
    if (cmd.subcommands.length != 0) {
      let idx = cmd.subcommands.findIndex(el => {
        return el.name == args[1]
      });
      if (idx === -1) {
        let list = cmd.subcommands.map(s => s.name).join(" | ");
        let e = cmd.subcommandError.replace(/\$cmdlist/gi, list).replace(/\$previousCmd/gi, previous);
        return this.replyHandler(e, msg);
      }
    }
  }
  addCommand(builder) {
    this.commandNames.push(builder.name);
    this.commands.push(builder);
    return this.commands;
  }
}

module.exports = { CommandHandler, CommandBuilder };
