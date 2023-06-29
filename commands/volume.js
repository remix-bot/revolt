const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("volume")
    .setDescription("Change the current volume.", "commands.volume")
    .addNumberOption(o =>
      o.setName("volume")
        .setDescription("The new volume in perentages. If you go above 100% there might be quality loss. (e.g. `30` or `100`)")
        .setRequired(true)
    )
    .addAliases("v", "vol"),
  run: async function(message, data) {
    const p = await this.getPlayer(message);
    if (!p) return;
    let res = p.setVolume(data.get("volume").value / 100);
    message.channel.sendMessage(this.em(res, message));
  }
}
