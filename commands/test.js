const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("test")
    .setDescription("A test command used for various purposes.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ).addUserOption(o =>
      o.setName("user")
        .setDescription("A user")),
  run: async function(msg, data) {
    console.log(typeof msg, msg instanceof require("revolt.js").Message, require("revolt.js").Message);
    msg.reply(data.get("user").value ?? "empty");
    console.log(data.get("user").value, data.get("user").value ?? "empty")
  }
}
