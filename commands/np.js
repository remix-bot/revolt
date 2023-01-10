const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("np")
    .setDescription("Request the name and url of the current playing song.")
    .addAliases("current", "nowplaying"),
  run: function(msg) {
    const p = this.getPlayer(msg);
    if (!p) return;
    msg.channel.sendMessage(this.em(p.nowPlaying()));
  }
}
