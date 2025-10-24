const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("forceleave")
    .addAlias("fl")
    .setDescription("Make Remix leave a channel even if you're not in it.")
    .addRequirement(r => r.addPermission("ManageChannel"))
    //.addRequirement(r => r.setOwnerOnly(true))
    .addChannelOption(o =>
      o.setName("channelId")
        .setDescription("The channel that should be left.")
        .setRequired(true)
    ),
  run: async function(msg, data) {
    const cid = data.get("channelId").value;
    if (msg.channel.server.id !== this.client.channels.get(cid)?.server.id) return msg.reply(this.em("This command has to be run in the same server as the voice channel.", msg), false)
    const p = this.playerMap.get(cid);
    if (!p) return msg.reply(this.em("Player not found", msg));
    if (!p.connection) return msg.reply(this.em("Player not initialized.", msg), false);
    this.leaveChannel.call(this, msg, cid, p);
  }
}
