const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("login")
    .setDescription("Generate a code to connect your remix account with your revolt account.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ),
  run: function(msg) {
    msg.reply("WIP", false);
  }
}
