const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("np")
    .setDescription("Request the name and url of the currently playing song.", "commands.np")
    .addAliases("current", "nowplaying"),
  run: async function(msg) {
    const p = await this.getPlayer(msg);
    if (!p) return;
    msg.reply(this.em("Loading...", msg)).then(async m => {
      let data = await p.nowPlaying();
      let embed = this.em(data.msg, m);
      if (data.image) embed.embeds[0].media = data.image;
      m.edit(embed);
    });
  }
}
