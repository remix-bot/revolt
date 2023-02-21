const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("leave")
    .setDescription("Make the bot leave your current voice channel")
    .addAlias("l"),
  run: async function(msg) {
    const p = await this.getPlayer(msg, false);
    if (!p) return;
    const user = this.revoice.getUser(msg.author_id).user;
    const cid = user.connectedTo;
    this.playerMap.delete(cid);
    const port = p.port - 3050;
    const m = await msg.reply(this.em("Leaving...", msg), false)
    const left = p.leave();
    //p.leave().then(async left => {
    p.destroy(); // wait for the ports to be open again
    this.freed.push(port);
    m.edit(this.em((left) ? `:white_check_mark: Successfully Left` : `Not connected to any voice channel`, msg))
  }
}
