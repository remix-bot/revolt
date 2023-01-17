const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("np")
    .setDescription("Request the name and url of the currently playing song.")
    .addAliases("current", "nowplaying"),
  run: async function(msg) {
    const p = this.getPlayer(msg);
    if (!p) return;
    let data = await p.nowPlaying();
    let m = this.em(data.msg);
    if (data.image) m.embeds[0].media = data.image;
    msg.channel.sendMessage(m);
  }
}
