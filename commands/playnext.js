const { CommandBuilder } = require("../Commands.js");
module.exports = {
  command: new CommandBuilder()
    .setName("playnext")
    .setId("playnext")
    .setDescription("Play a youtube video from url/query or a playlist by url. The result will be added to the top of the queue.")
    .addTextOption((option) =>
      option.setName("query")
        .setDescription("A youtube query/url or youtube playlist url")
        .setRequired(true)
    ).addAlias("pn"),
  run: async function(message, data) {
    const p = await this.getPlayer(message);
    if (!p) return;
    const query = data.options[0].value // only 1 text option registered
    message.reply(this.em("Searching...", message), false).then((msg) => {
      const messages = p.playFirst(query);
      messages.on("message", (d) => {
        msg.edit(this.em(d, message));
      });
    });
  }
}
