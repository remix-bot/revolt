const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("test")
    .setDescription("A test command used for various purposes.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ),
  run: async function(msg, data) {
    console.log(typeof msg, msg instanceof require("revolt.js").Message, require("revolt.js").Message);
  }
}
