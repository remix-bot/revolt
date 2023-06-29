const { CommandBuilder } = require("../Commands.js");
module.exports = {
  command: new CommandBuilder()
    .setName("play")
    .setId("play")
    .setDescription("Play a youtube video from url/query or a playlist by url. Other services are supported as well.", "commands.play")
    .addTextOption((option) =>
      option.setName("query")
        .setDescription("A YouTube query/url, playlist url, or a link to a Spotify, SoundCloud, or YouTube Music song.", "options.play.query")
        .setRequired(true)
    ).addAlias("p"),
  run: async function(message, data) {
    const p = await this.getPlayer(message);
    if (!p) return;
    const query = data.options[0].value // only 1 text option registered
    message.reply(this.em("Searching...", message), false).then((msg) => {
      const messages = p.play(query);
      messages.on("message", (d) => {
        msg.edit(this.em(d, message));
      });
    });
  }
}
