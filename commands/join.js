const { CommandBuilder } = require("../Commands.js");
const RevoltPlayer = require("../Player.js");

module.exports = {
  command: new CommandBuilder()
    .setName("join")
    .setDescription("Make the bot join a specific voice channel.")
    .setId("join")
    .addChannelOption((option) =>
      option.setName("Channel ID")
        .setDescription("Specify the channel, the bot should join. This is necessary due to Revolt limitations.")
        .setRequired(true)
    ),
  run: function(message, data) {
    const cid = data.options[0].value;
    if (!message.channel.server.channels.some(c => c._id === cid)) {
      return message.reply(this.em("Couldn't find the channel `" + cid + "` in this server.\nUse the help command to learn more about this.", message))
    }
    if (this.playerMap.has(cid)) {
      return message.reply(this.em("Already joined. <#" + cid + ">", message));
    }
    this.channels.push(cid);
    const settings = this.settingsMgr.getServer(message.channel.server_id);
    const pOff = this.freed.shift() || ++this.currPort; // reuse old ports
    const p = new RevoltPlayer(this.config.token, {
      voice: this.revoice,
      portOffset: pOff,
      client: this.client,
      spotify: this.spotifyConfig,
      settings: settings
    });
    p.on("autoleave", async () => {
      message.channel.sendMessage(this.em("Left channel <#" + cid + "> because of inactivity.", message));
      const port = p.port - 3050;
      this.playerMap.delete(cid);
      p.destroy();
      this.freed.push(port);
    });
    p.on("message", (m) => {
      if ((this.settingsMgr.getServer(message.channel.server_id).get("songAnnouncements") + "") == "false") return;
      message.channel.sendMessage(this.em(m, message))
    })
    this.playerMap.set(cid, p);
    message.reply(this.em("Joining Channel...", message)).then((message) => {
      p.join(cid).then(() => {
        message.edit(this.em(`:white_check_mark: Successfully joined <#${cid}>`, message));
      });
    });
  }
}
