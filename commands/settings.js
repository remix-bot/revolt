const { CommandBuilder } = require("../Commands.js");
const runnables = require("../settings/runnables");

module.exports = {
  command: function() {
    return new CommandBuilder()
      .setName("settings")
      .setDescription("Change/Get settings in the current server.", "commands.settings")
      .addAliases("s")
      .addExamples("$prefixsettings get", "$prefixsettings get locale", "$prefixsettings set locale de-DE")
      .setCategory("util")
      .addRequirement(e => e.addPermission("ManageServer"))
      .addSubcommand(cmd =>
        cmd.setName("set")
          .setId("setSettings")
          .setDescription("Set the value of a specific setting.", "subcommands.settings.set")
          .addChoiceOption(c =>
            c.addChoices(...Object.keys(this.settingsMgr.defaults))
              .setName("setting")
              .setDescription("The name of the setting you want to set.", "options.settings.set.setting")
              .setRequired(true)
          ).addTextOption(c =>
            c.setName("value")
              .setDescription("The new value.", "options.settings.set.value")
              .setRequired(true))
      ).addSubcommand(cmd =>
        cmd.setName("get")
          .setDescription("Get the value of a specific setting or the settings of the server.", "subcommands.settings.get")
          .setId("getSettings")
          .addChoiceOption(c =>
            c.addChoices(...Object.keys(this.settingsMgr.defaults))
              .setName("setting")
              .setDescription("Get the current value of a setting.", "options.settings.get.setting")
              .setRequired(false)
            )
      )
  },
  run: function(message, data) {
    const set = this.getSettings(message);
    const cmd = data.commandId;
    switch(cmd) {
      case "setSettings":
        var failed = false;
        if (runnables[data.get("setting").value]) failed = runnables[data.get("setting").value].call(this, data.get("value").value, { msg: message, d: data })
        if (failed) return message.reply(this.em(failed, message), false);
        set.set(data.get("setting").value, data.get("value").value);
        message.reply(this.em("Settings changed!", message), false);
      break;
      case "getSettings":
        const setting = data.get("setting").value;
        if (setting) return message.reply(this.em(`\`${setting}\` is set to \`${set.get(setting)}\``, message), false);
        const d = set.getAll();
        let msg = "The settings for this server (" + message.channel.server.name + ") are as following: \n\n";
        for (key in d) {
          msg += "- " + key + ": `" + d[key] + "`\n";
        }
        message.reply(this.iconem("Settings", msg.trim(), message.channel.server.iconURL, message), false);
      break;
    }
  }
}
