const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("resume")
    .setDescription("Resume the playback in your voice channel"),
  run: function(message) {
    const p = this.getPlayer(message);
    if (!p) return;
    let res = p.resume() || `:white_check_mark: The song has been resumed!`;
    message.channel.sendMessage(this.em(res));
  }
}
