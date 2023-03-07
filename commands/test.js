const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("test")
    .setDescription("A test command used for various purposes.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ).addStringOption(o =>
      o.setName("string")
        .setRequired(true)
    ).addNumberOption(o =>
      o.setName("number")
        .setRequired(true)),
  run: async function(msg, data) {
    msg.reply(this.em(data.get("string").value, msg), false);
    let e = { embeds: [{ media: await this.uploader.uploadFile("./storage/test.jpg"), ...this.em(data.get("number").value, msg).embeds[0] }] };
    msg.reply(e, false);
  }
}
