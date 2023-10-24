const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("forceleave")
    .addAlias("fl")
    .setDescription("force leave channel without being in it; dev only")
    .addRequirement(r => r.setOwnerOnly(true))
    .addChannelOption(o =>
      o.setName("channelId")
        .setDescription("The channel it should leave")
        .setRequired(true)
    ),
  run: async function(msg, data) {
    const cid = data.get("channelId").value;
    const p = this.playerMap.get(cid);
    if (!p) return msg.reply(this.em("Player not found", msg));
    if (!p.connection) return msg.reply(this.em("Player not initialized.", msg), false);
    this.leaveChannel.call(this, msg, cid, p);
  }
}
