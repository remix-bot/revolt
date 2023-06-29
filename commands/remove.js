const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("remove")
    .setDescription("Remove a specific song from the queue.", "commands.remove")
    .addNumberOption(opt =>
      opt.setName("index")
        .setDescription("The position of the song in the queue. You can view the indeces with the 'list' command")
        .setRequired(true)
    ),
  run: async function(message, data) {
    const p = await this.getPlayer(message);
    if (!p) return;
    let res = p.remove(data.options[0].value);
    message.channel.sendMessage(this.em(res, message));
  }
}
