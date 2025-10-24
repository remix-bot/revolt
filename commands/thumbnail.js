const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("thumbnail")
    .setDescription("Request the thumbnail of the currently playing song.", "commands.thumbnail")
    .addAliases("thumb"),
  run: async function(msg) {
    const p = await this.getPlayer(msg);
    if (!p) return;
    let data = await p.getThumbnail();
    let m = this.em(data.msg, msg);
    if (data.image) m.embeds[0].media = data.image;
    msg.channel.sendMessage(m);
  }
}
