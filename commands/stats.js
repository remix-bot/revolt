const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("stats")
    .setDescription("Display stats about the bot like the uptime.", "commands.stats")
    .addAliases("info")
    .setCategory("util"),
  run: function(message) {
    const reason = (this.config.restart) ? ":screwdriver: Cause for last restart: `" + this.config.restart + "`\n": "";
    const version = ":building_construction: Build: [`" + this.comHash + "` :link:](" + this.comLink + ")";
    const time = this.prettifyMS(Math.round(process.uptime()) * 1000);
    const footer = this.config.customStatsFooter || "";
    const users = (this.config.fetchUsers) ? `\n:adult: User Count: \`${this.client.users.size}\`` : "";
    message.channel.sendMessage(this.em(`__**Stats:**__\n\n:open_file_folder: Server Count: \`${this.client.servers.size()}\`${users}\n:mega: Player Count: \`${this.revoice.connections.size}\`\n🏓 Ping: \`${this.client.events.ping()}ms\`\n⌚️ Uptime: \`${time}\`\n${reason}${version}${footer}`, message));
  }
}
