const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("test")
    .setDescription("A test command used for various purposes.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ).addNumberOption(o =>
      o.setName("number")
        .setRequired(true)),
  run: function(msg, data) {
    msg.reply(this.paginate("test\ntest1\ntest2\ntest3\ntest4", 2, data.get("number").value).join("\n"), false)
    const observer = this.observeUser(msg.author_id, msg.channel._id, (m) => {
      m.reply(this.em(`Valid: ${this.handler.validateString(m.content, m, "channel")}; formatted: ${this.handler.formatString(m.content, m, "channel")}`, m), false);
      this.unobserveUser(observer);
    });
  }
}
