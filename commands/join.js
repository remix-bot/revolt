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
      return message.reply({ content: " ", embeds: [ this.embedify("Couldn't find the channel `" + cid + "` in this server.\nUse the help command to learn more about this.")]})
    }
    if (this.playerMap.has(cid)) {
      return message.reply({ content: " ", embeds: [ this.embedify("Already joined. <#" + cid + ">")]});
    }
    this.channels.push(cid);
    const pOff = this.freed.shift() || ++this.currPort; // reuse old ports
    const p = new RevoltPlayer(this.config.token, {
      voice: this.revoice,
      portOffset: pOff
    });
    p.on("autoleave", async () => {
      //data.message.channel.sendMessage("Left the channel <#" + cid + "> because of inactivity.");
      message.channel.sendMessage({
        content: " ",
        embeds: this.embedify("Left the channel <#" + cid + "> because of inactivity."),
      });
      const port = p.port - 3050;
      this.playerMap.delete(cid);
      p.destroy();
      this.freed.push(port);
    });
    this.playerMap.set(cid, p);
    message.reply("Joining Channel...").then((message) => {
      p.join(cid).then(() => {
        message.edit({
          content: " ",
          embeds: this.embedify(`:white_check_mark: Successfully joined <#${cid}>`),
        });
      });
    });
  }
}
