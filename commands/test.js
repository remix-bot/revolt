const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("test")
    .setDescription("A test command used for various purposes.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ).addUserOption(o =>
      o.setName("user")
        .setDescription("A user")
        .addFlagAliases("u")
        .setDefault("01G9MCW5KZFKT2CRAD3G3B9JN5")
        .setId("testOption")
    , true).addStringOption(o =>
      o.setName("string")
        .setDescription("A cool string")
        .setRequired(true)),
  run: async function(msg, data) {
    console.log(data.options);
    msg.reply(this.em("Ref String: " + data.get("string").value + " Option received: " + data.getById("testOption")?.value, msg), false)
  }
}
