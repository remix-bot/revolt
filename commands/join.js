const { CommandBuilder } = require("../Commands.js");
const RevoltPlayer = require("../Player.js");

function joinChannel(message, cid, cb=()=>{}, ecb=()=>{}) {
  if (!message.channel.server.channels.some(c => c._id === cid)) {
    ecb();
    return message.reply(this.em("Couldn't find the channel `" + cid + "` in this server.\nUse the help command to learn more about this.", message), false)
  }

  if (this.playerMap.has(cid)) {
    cb();
    return message.reply(this.em("Already joined. <#" + cid + ">", message), false);
  }
  this.channels.push(cid);
  const settings = this.settingsMgr.getServer(message.channel.server_id);
  const pOff = this.freed.shift() || ++this.currPort; // reuse old ports
  const p = new RevoltPlayer(this.config.token, {
    voice: this.revoice,
    portOffset: pOff,
    client: this.client,
    spotify: this.spotifyConfig,
    uploader: this.uploader,
    settings: settings,
    spotifyClient: this.spotify,
    geniusClient: this.geniusClient
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
  });
  this.playerMap.set(cid, p);
  message.reply(this.em("Joining Channel...", message), false).then((message) => {
    p.join(cid).then(() => {
      message.edit(this.em(`:white_check_mark: Successfully joined <#${cid}>`, message));
      cb();
    });
  });
}

module.exports = {
  command: new CommandBuilder()
    .setName("join")
    .setDescription("Make the bot join a specific voice channel.")
    .setId("join")
    .addChannelOption((option) =>
      option.setName("Channel ID")
        .setType("voiceChannel")
        .setDescription("Specify the channel, the bot should join. This is necessary due to (current) Revolt limitations.")
        .setRequired(true)
    ),
  run: function(message, data) {
    const cid = data.options[0].value;
    joinChannel.call(this, message, cid);
  },
  export: {
    name: "joinChannel",
    object: joinChannel
  }
}
