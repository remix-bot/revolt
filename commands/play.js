const { CommandBuilder } = require("../Commands.js");
module.exports = {
  command: new CommandBuilder()
    .setName("play")
    .setId("play")
    .setDescription("Play a youtube video from url/query or a playlist by url.")
    .addTextOption((option) =>
      option.setName("query")
        .setDescription("A youtube query/url or youtube playlist url")
        .setRequired(true)
    ),
  run: function(message) {
    const p = this.getPlayer(message);
    if (!p) return "It doesn't seem like we're in the same voice channel.";
    const query = data.options[0].value // only 1 text option registered
    data.message.reply("Searching...").then((msg) => {
      const messages = p.play(query);
      messages.on("message", (data) => {
        msg.edit({
          content: " ",
          embeds: this.embedify(data),
        });
      });
    });
  }
}
