const EventEmitter = require("events");

class CommandBuilder extends EventEmitter {
  constructor() {
    super();

    this.name = null;
    this.description = null;
    this.id = null;
    this.aliases = [];
    this.subcommands = [];
    this.options = [];
    this.requirements = [];
    this.uid = this.guid();

    this.subcommandError = "Invalid subcommand. Try one of the following options: `$previousCmd <$cmdlist>`";
    this.parent = null;

    return this;
  }
  guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }
  get command() {
    return (this.parent) ? this.parent.command + " " + this.name : this.name;
  }
  set command(_val) {
    throw "Disabled";
  }
  setName(n) {
    this.name = n;
    this.aliases.push(n.toLowerCase());
    return this;
  }
  setDescription(d) {
    this.description = d;
    return this;
  }
  setId(id) {
    this.id = id;
    return this;
  }
  addRequirement(config) {
    let req = config(new CommandRequirement());
    this.requirements.push(req);
    return this;
  }
  addSubcommand(config) {
    let sub = config(new CommandBuilder());
    sub.parent = this;
    this.subcommands.push(sub);//new SubcommandBuilder()));
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
  addTextOption(config) {
    if (this.options.findIndex(e=>e.type=="text") !== -1) throw "There can only be 1 text option.";
    this.options.push(config(new Option("text")));
    return this;
  }
  addChoiceOption(config) {
    this.options.push(config(new Option("choice")));
    return this;
  }
  addAlias(alias) {
    if (this.aliases.findIndex(e => e == alias.toLowerCase()) !== -1) return; // alias already added
    this.aliases.push(alias.toLowerCase());
    return this;
  }
  addAliases(...aliases) {
    aliases.forEach((a) => this.addAlias(a));
    return this;
  }
}
class CommandRequirement {
  ownerOnly = false;
  constructor() {
    this.permissions = [];
    this.permissionError = "You don't have the needed permissions to run this command!";

    return this;
  }
  setOwnerOnly(bool) {
    this.ownerOnly = bool;
    return this;
  }
  addPermission(p) {
    this.permissions.push(p);
    return this;
  }
  addPermissions(...p) {
    this.permissions.push(...p);
    return this;
  }
  getPermissions() {
    return this.permissions;
  }
  setPermissionError(e) {
    this.permissionError = e;
  }
}
class Option {
  constructor(type="string") {
    this.name = null;
    this.description = null;
    this.required = false
    this.id = null;

    this.type = type;
    this.tError = null;
    this.choices = []; // only for choice options

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
  setRequired(r) {
    this.required = r;
    return this;
  }
  setId(id) {
    this.id = id;
    return this;
  }
  addChoice(c) {
    if (this.type != "choice") throw ".addChoice is only available for choice options!";
    this.choices.push(c);
    return this;
  }
  addChoices(...cs) {
    if (this.type != "choice") throw ".addChoices is only available for choice options!";
    cs.forEach(c => this.addChoice(c));
    return this;
  }
  empty(i) {
    // FIXME: ig
    if (i == undefined) return true;
    return (!i && !i.contains("0")); // check if string is empty
  }
  validateInput(i, message, type) {
    switch(type || this.type) {
      case "text":
      case "string":
        return !!i; // check if string is empty
      case "number":
        return !isNaN(i) && !isNaN(parseFloat(i));
      case "boolean":
        return (
          i == "0" ||
          i == "1" ||
          i.toLowerCase() == "true" ||
          i.toLowerCase() == "false"
        );
      case "choice":
        return this.choices.includes(i);
      case "user": // TODO: Add user validation
        // check if string is empty
        return !!i;
      case "channel":
        const channelRegex = /^<#(?<id>[A-Z0-9]+)>$/;
        const idRegex = /^(?<id>[A-Z0-9]+)$/;

        return channelRegex.test(i) || idRegex.test(i) || message.channel.server.channels.some(c => c.name == i);
      // TODO: Add roles
    }
  }
  formatInput(i, msg, type) {
    switch (type || this.type) {
      case "text":
      case "string":
        return i;
      case "number":
        return parseFloat(i);
      case "boolean":
        return i.toLowerCase() === "true" || i == "1"; // NOTE: this should cover the allowed values from .validateInput()
      case "choice":
      case "user":
        return i; // TODO: implement choice types
      case "channel":
        const channelRegex = /^<#(?<id>[A-Z0-9]+)>$/;
        const idRegex = /^(?<id>[A-Z0-9]+)$/;
        const results = channelRegex.exec(i) ?? idRegex.exec(i);

        const channel = msg.channel.server.channels.find(c => c.name == i);
        return (results) ? results.groups["id"] : (channel) ? channel._id : null;
    }
  }
  get typeError() {
    if (this.tError) return this.tError;
    switch(this.type) {
      case "choice":
        let e = "Invalid value '$currValue'. The option `$optionName` has to be one of the following options: \n";
        e += "- " + this.choices.join("\n- ");
        e += "\nSchematic: `$previousCmd <$optionType>`";
        return e;
      case "channel":
        return "Invalid value '$currValue'. The option `$optionName` has to be a channel mention or id.\nSchematic: `$previousCmd <$optionType>`";
      default:
        return "Invalid value '$currValue'. The option `$optionName` has to be of type `$optionType`.\nSchematic: `$previousCmd <$optionType>`";;
    }
  }
  set typeError(e) {
    this.tError = e;
  }
}

class CommandHandler extends EventEmitter {
  customPrefixes = new Map();
  cachedGuilds = [];
  parentCallback = null;
  onPing = null;
  pingPrefix = true;
  owners = [];

  constructor(client, prefix="!") {
    super();

    this.client = client;
    this.prefix = prefix;
    this.acceptCommand = "a";
    this.helpCommand = "help";
    this.commandNames = [];
    this.commands = [];

    this.fixMap = new Map(); // typo corrections

    this.minMatchScore = 0.75;
    this.msgCharLimit = 2000;
    this.helpContentCharLimit = 250;
    this.commandLimit = 5;
    this.replyHandler = (t, msg) => {
      msg.reply(t);
    }

    this.client.on("message", (msg)=>this.messageHandler(msg))

    return this;
  }
  getPrefix(guildId) {
    if (!guildId) return this.prefix;
    if (!this.cachedGuilds.includes(guildId)) return this.prefix;
    if (!this.customPrefixes.has(guildId)) return this.prefix;
    return this.customPrefixes.get(guildId);
  }
  messageHandler(msg) {
    if (!msg || !msg.content) return;
    if (!this.cachedGuilds.includes(msg.channel.server_id)) {
      this.cachedGuilds.push(msg.channel.server_id);
      let cp = this.request("prefix", msg);
      if (cp !== this.prefix) {
        this.customPrefixes.set(msg.channel.server_id, cp);
      }
    }
    if (msg.mention_ids) {
      if (msg.mention_ids.includes(this.client.user._id) && msg.content.trim().toUpperCase() == `<@${this.client.user._id}>`) {
        return this.onPing(msg);
      }
    }
    const prefix = this.getPrefix(msg.channel.server_id);
    const ping = `<@${this.client.user._id}> `;
    if (!(msg.content.startsWith(prefix) || msg.content.startsWith(ping))) return;
    const len = (msg.content.startsWith(prefix)) ? prefix.length : ping.length;
    const args = msg.content
      .slice(len)
      .trim()
      .split(" ")
      .map((el) => el.trim())
    if (args[0] === this.acceptCommand && this.fixMap.has(msg.author_id)) {
      //if (!this.fixMap.has(msg.author_id)) return this.replyHandler(this.f("No command stored that can be corrected!"));
      let cmd = this.fixMap.get(msg.author_id);
      this.fixMap.delete(msg.author_id);
      return this.processCommand(cmd.cmd, cmd.args, msg);
    } else if (args[0] === this.helpCommand) {
      if (!args[1]) return this.replyHandler(this.f(this.getHelpPage(this.commandLimit, 0, ...this.commands), msg.channel.server_id), msg);

      if (args.length > 1) {
        // check if a new page is requested
        let newPage = this.isNumber(args[1]);
        if (newPage) {
          newPage = parseInt(args[1]);
          if (newPage < 1 || newPage > this.getHelpPages()) return this.replyHandler("`" + newPage + "` is not a valid page number!", msg);
          return this.replyHandler(this.f(this.getHelpPage(this.commandLimit, newPage - 1, ...this.commands), msg.channel.server_id), msg);
        }
      }

      if (args.length > 2) {
        let currCmd = null;
        let prefix = "";
        for (let i = 0; i < args.slice(1).length; i++) {
          let a = args.slice(1)[i];
          let curr = (currCmd) ? currCmd.subcommands : this.commands;
          let idx = curr.findIndex(e => e.name.toLowerCase() == a.toLowerCase());
          if (idx === -1) return this.replyHandler(this.f("Unknown command `$prefix" + prefix + a + "`!", msg.channel.server_id), msg);
          currCmd = curr[idx];
          prefix += a + " ";
        }
        return this.replyHandler(this.genCommandHelp(currCmd), msg);
      } else {
        let idx = this.commands.findIndex(e => e.name.toLowerCase() == args[1].toLowerCase());
        if (idx === -1) return this.replyHandler(this.f("Unknown command `$prefix" + args[1] + "`!", msg.channel.server_id), msg);
        return this.replyHandler(this.genCommandHelp(this.commands[idx]), msg);
      }
    }
    if (!this.commandNames.includes(args[0].toLowerCase())) {
      // unknown command; try to find a similar command
      // TODO: include help command in search
      // TODO: fix aliases being preferred/being selected without any actual match with the word
      const matches = this.commandNames.filter(c => c.length > 1).map(c => {
        return {
          score: this.calcMatch(args[0], c),
          command: c
        }
      });
      matches.sort((a,b) => b.score-a.score);
      if (matches[0].score < this.minMatchScore) return; // unknown command, not similar to existing one

      // match found, suggest to user
      let cmd = this.commands.find(e => e.aliases.includes(matches[0].command));
      this.fixMap.set(msg.author_id, { cmd: cmd, args: args });

      let fixed = matches[0].command + " " + args.slice(1).join(" ");
      this.replyHandler(this.f("Did you mean `$prefix" + fixed + "`? (Type `$prefix$accept` to run this)", msg.channel.server_id), msg);
      return;
    }
    return this.processCommand(this.commands.find(e => e.aliases.includes(args[0].toLowerCase())), args, msg);
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
  setHelpCommand(name) {
    this.helpCommand = name;
  }
  setReplyHandler(reply) {
    this.replyHandler = reply;
  }
  setPrefix(p) {
    this.prefix = p;
  }
  setPingPrefix(bool) {
    this.pingPrefix = bool;
  }
  setCustomPrefix(guildId, p) {
    //if (p == this.prefix) return; // comment because this prevents resetting of the prefix
    if (!this.cachedGuilds.includes(guildId)) this.cachedGuilds.push(guildId);
    this.customPrefixes.set(guildId, p);
  }
  setOnPing(cb) {
    this.onPing = cb;
  }
  request(type, data) {
    return this.parentCallback.call(this, { type, data });
  }
  setRequestCallback(cb) {
    this.parentCallback = cb;
  }
  setAcceptCommand(c) {
    this.acceptCommand = c;
    return this.acceptCommand;
  }
  isNumber(n) {
    return !isNaN(n) && !isNaN(parseFloat(n));
  }
  addOwners(...ids) {
    this.owners.push(...ids)
    return this.owners;
  }
  userCommands(cmds) {
    return cmds.filter(c =>
      c.requirements.findIndex(r =>
        r.ownerOnly
      ) === -1);
  }
  validateString(s, msg, type) {
    return (new Option()).validateInput(s, msg, type);
  }
  formatString(s, msg, type) {
    return (new Option()).formatInput(s, msg, type);
  }

  f(text, i) { // text format function
    text = text.replace(/\$prefix/gi, this.getPrefix(i));
    text = text.replace(/\$accept/gi, this.acceptCommand);
    text = text.replace(/\$helpCmd/gi, this.helpCommand);
    return text;
  }
  processCommand(cmd, args, msg, previous=false) {
    if (cmd.requirements.length > 0) {
      const server = msg.member.server;
      for (let i = 0; i < cmd.requirements.length; i++) {
        let req = cmd.requirements[i];
        if (req.ownerOnly && !this.owners.includes(msg.author_id)) return;
        for (let j = 0; j < req.getPermissions().length; j++) {
          let p = req.getPermissions()[j];
          if (!msg.member.hasPermission(server, p)) return this.replyHandler(req.permissionError, msg);
        }
      }
    }
    if (previous === false) previous = this.f("$prefix" + cmd.name, msg.channel.server_id);
    if (!cmd) return console.warn("Something sus is going on... [CommandHandler.processCommand]");
    this.emit("command", { command: cmd, message: msg });
    if (cmd.subcommands.length != 0) {
      // If there are any subcommands, ignore options
      let idx = cmd.subcommands.findIndex(el => {
        if (!args[1]) return false;
        return el.name.toLowerCase() == args[1].toLowerCase()
      });
      if (idx === -1) {
        let list = cmd.subcommands.map(s => s.name).join(" | ");
        let e = cmd.subcommandError.replace(/\$cmdlist/gi, list).replace(/\$previousCmd/gi, previous);
        return this.replyHandler(e, msg);
      }
      return this.processCommand(cmd.subcommands[idx], args.slice(1), msg, previous + this.f(" " + cmd.subcommands[idx].name));
    }
    // validate options
    let opts = [];
    let texts = [];
    var exit = false;
    cmd.options.forEach((o, i) => {
      if (o.type == "text") return texts.push(o); // text options are processed last
      i -= texts.length;
      let valid = o.validateInput(args[i + 1], msg); // +1 excluding the command itself
      if (!valid && (o.required || !o.empty(args[i + 1]))) {
        let e = o.typeError.replace(/\$optionType/gi, o.type).replace(/\$previousCmd/gi, previous).replace(/\$currValue/gi, args[i + 1]).replace(/\$optionName/gi, o.name);
        exit = true;
        return this.replyHandler(e, msg);
      }
      previous += " " + args[i + 1];
      opts.push({
        value: o.formatInput(args[i + 1], msg),
        name: o.name,
        id: o.id
      });
    });
    if (exit) return; // exit if there was an error validating an option
    if (texts.length > 0) {
      let o = texts[0];
      let os = cmd.options.length - texts.length;
      let text = args.slice(os + 1).join(" ");
      if (o.required && !o.validateInput(text, msg)) {
        let e = o.typeError.replace(/\$optionType/gi, o.type).replace(/\$previousCmd/gi, previous).replace(/\$currValue/gi, text).replace(/\$optionName/gi, o.name);
        return this.replyHandler(e, msg);
      }
      opts.push({
        name: o.name,
        value: text,
        id: o.id
      });
    }
    this.emit("run", {
      command: cmd,
      commandId: cmd.id,
      options: opts,
      message: msg,
      get: function(oName) {
        return this.options.find(o => o.name == oName);
      },
      getById: function(id) {
        return this.options.find(o => o.id == id);
      }
    });
  }
  addCommand(builder) {
    this.commandNames.push(...builder.aliases);
    this.commands.push(builder);

    this.commands.sort((a, b) => {
      let A = a.name.toUpperCase();
      let B = b.name.toUpperCase();
      return (A < B) ? -1 : (A > B) ? 1 : 0;
    });

    return this.commands;
  }
  getHelpPages(cmdLimit=5) {
    return Math.ceil(this.commands.length / cmdLimit);
  }
  getHelpPage(cmdLimit=5, currPage=0, ...cmds) {
    const split = (cmdLimit < cmds.length);
    if (!split) return this.genHelp(null, ...cmds); // no need to chunk it into pages

    let s = (cmdLimit) * currPage;
    const commands = cmds.slice(s, s + cmdLimit);
    let max = Math.ceil(cmds.length / cmdLimit);
    let offset = cmdLimit * currPage;

    return this.genHelp({ curr: currPage + 1, max, offset }, ...commands);
  }
  genHelp(page=null, ...cmds) {
    // TODO: make help more customizable
    if (cmds.length == 0) cmds.push(...this.userCommands(this.commands));
    cmds = this.userCommands(cmds);
    let p = (page) ? ` (page ${page.curr}/${page.max})` : "";
    const indexOffset = (page) ? page.offset : 0;

    let content = "Available Commands" + p + ": \n\n";
    if (page && page.curr != 1) content += (indexOffset) + ". [...]\n";

    cmds.forEach((cmd, i) => {
      content += (i + 1 + indexOffset) + ". **" + cmd.name + "**: " + cmd.description + "\n";
    });
    if (page && page.curr != page.max) content += (cmds.length + indexOffset) + ". [...]\n";

    content += "\nRun `$prefix$helpCmd <command>` to learn more about it. You can also include subcommands.\n";
    content += "For example: `$prefix$helpCmd command subcommandName`";
    if (page) content += "\n\nTip: Turn pages by using `$prefixhelp <page number>`"

    return content;
  }
  genCommandHelp(cmd) { // TODO: add better indicator for optional parameters/subcommands/options
    let content = "# " + this.capitalize(cmd.name) + "\n";
    content += cmd.description + "\n\n";
    if (cmd.aliases.length > 1) {
      content += "**Aliases:** \n";
      cmd.aliases.forEach(alias => {
        content += "- " + alias + "\n";
      });
      content += "\n";
    }
    if (cmd.subcommands.length > 0) {
      content += "**Subcommands:** \n";
      cmd.subcommands.forEach(s => {
        content += "- " + s.name + ": " + s.description + "\n";
      });
      content += "\n";
    } else if (cmd.options.length > 0) {
      content += "**Options:** \n";
      cmd.options.forEach(o => {
        if (o.type == "choice") {
          content += "- " + o.name + ": " + o.description + "; Allowed values: `" + o.choices.join("`, `") + "`\n";
        } else {
          content += "- " + o.name + ": " + o.description + "\n";
        }
      });
      content += "\n";
    }
    if (cmd.requirements.length > 0) { // TODO: add requirement inheritance (displaying parent requirements on subcommand help page)
      content += "**Requirements:** \n\n";
      content += "Permissions: \n";
      cmd.requirements.forEach(r => {
        content += "- " + r.getPermissions().map(e=>"`" + e + "`").join("\n- ")
      });
      content += "\n\n";
    }
    content += "Usage: `" + this.genCmdUsage(cmd) + "`";

    return content;
  }
  genCmdUsage(cmd) {
    if (cmd.subcommands.length > 0) {
      return cmd.command + " <" + cmd.subcommands.map(e=>e.name).join(" | ") + ">".trim();
    } else {
      let options = this.f("$prefix" + cmd.command); // TODO: fix this
      cmd.options.forEach(o => {
        if (o.type == "text") return;
        options += (o.type == "choice") ? " <" + o.choices.join(" | ") + ">" : " '" + o.name + ": " + o.type + "'";
      });
      let o = cmd.options.find(e=>e.type=="text");
      if (o) options += " '" + o.name + ": " + o.type + "'";
      return options.trim();
    }
  }
  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  generateCommandOverviewMD() {
    var table = "|Name|Description|Format|Alias|\n|---|---|---|---|\n";
    this.commands.forEach(c => {
      table += `|${c.name}|${c.description}|${this.genCmdUsage(c).replaceAll("|", "\\|")}|${c.aliases.join(", ")}|\n`;
    });
    return table;
  }
}

module.exports = { CommandHandler, CommandBuilder };
