const EventEmitter = require("events");

class CommandBuilder {
  constructor() {
    this.name = null;
    this.description = null;

    this.subCommands = [];

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
  addSubCommand(config) {
    this.subCommands.push(config(new SubCommandBuilder()));
    return this;
  }
}
class SubCommandBuilder extends CommandBuilder {
  constructor() {
    super();
  }
  addSubCommand() {
    console.warn("Unsupported.");
    // TODO: consider allowing it and just use a CommandBuilder class
  }
}

class CommandHandler extends EventEmitter {
  constructor(client, prefix="!") {
    super();

    this.client = client;
    this.prefix = prefix;
    this.commandNames = [];
    this.commands = [];

    this.minMatchScore = 0.25;

    this.client.on("message", messageHandler)

    return this;
  }
  messageHandler(msg) {
    if (!msg || !msg.content) return;
    if (!msg.content.startsWith(this.prefix)) return;
    const args = message.content
      .slice(this.prefix.length)
      .trim()
      .split(" ")
      .map((el) => el.trim())
    if (!this.commandNames.includes(args[0].toLowerCase())) {
      // unknown command; try to find a similar command
      const matches = this.commandNames.map(c => {
        return {
          score: this.calcMatch(args[0], c),
          command: c
        }
      });
      matches.sort((a,b) => b.score-a.score);
      if (matches[0].score < this.minMatchScore) return; // unknown command, not similar to existing one

      // match found, suggest to user
      // TODO: implement suggestions
    }
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
}

module.exports = { CommandHandler, CommandBuilder };
