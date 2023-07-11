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
    ).addChoiceOption(o =>
      o.setName("provider")
        .setDescription("The search result provider (YouTube or YouTube Music). Default: Youtube Music", "options.search.provider") // same as search provider flag
        .addFlagAliases("p", "u", "use")
        .addChoices("ytm", "yt")
        .setDefault("ytm")
    , true).addAlias("p"),
  run: async function(message, data) {
    const p = await this.getPlayer(message);
    if (!p) return;
    const query = data.get("query").value;
    message.reply(this.em("Searching...", message), false).then((msg) => {
      const messages = p.play(query, false, data.get("provider").value);
      messages.on("message", (d) => {
        msg.edit(this.em(d, message));
      });
    });
  }
}
