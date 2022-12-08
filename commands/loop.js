const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("loop")
    .setDescription("Toggle the looping of your queue/song.")
    .addChoiceOption(opt =>
      opt.setName("type")
        .addChoices("queue", "song")
        .setDescription("Specifies what loop should be toggled. (`song` | `queue`)")
        .setRequired(true)),
  run: async function(message, data) {
    const p = this.getPlayer(message, data);
    if (!p) return;
    const res = p.loop(data.options[0].value);
    message.channel.sendMessage(this.em(res));
  }
}
