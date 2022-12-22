const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("clear")
    .setDescription("Remove all songs from the queue.")
    .addAliases("c"),
  run: function(msg) {
    const p = this.getPlayer(msg);
    if (!p) return;
    msg.channel.sendMessage(this.em(":white_check_mark: Queue cleared."));
  }
}
