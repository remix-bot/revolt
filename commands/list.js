const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("list")
    .setDescription("List the queue in your current voice channel."),
  run: async function(message) {
    const p = this.getPlayer(message);
    if (!p) return;
    var messages = p.list();
    for (let i = 0; i < messages.length; i++) {
      await message.channel.sendMessage(this.em(messages[i], message));
    }
  }
}
