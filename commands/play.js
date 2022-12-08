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
    ).addAlias("p"),
  run: function(message, data) {
    const p = this.getPlayer(message);
    if (!p) return;
    const query = data.options[0].value // only 1 text option registered
    message.reply(this.em("Searching...")).then((msg) => {
      const messages = p.play(query);
      messages.on("message", (d) => {
        msg.edit(this.em(d));
      });
    });
  }
}
