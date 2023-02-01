const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("shuffle")
    .setDescription("Re-orders the queue randomly."),
  run: function(message) {
    const p = this.getPlayer(message);
    if (!p) return;
    let res = p.shuffle() || `:white_check_mark: Shuffled!`;
    message.channel.sendMessage(this.em(res, message));
  }
}
