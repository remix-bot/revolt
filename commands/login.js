const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("login")
    .setDescription("Generate a code to connect your remix account with your revolt account.")
    .addStringOption(o =>
      o.setName("id")
        .setDescription("The id you got from logging in at the dashboard.")
        .setRequired(true)),
  run: async function(msg, data) { // TODO: temporary login (without creating account)
    const log = data.get("id").value;
    const verified = await this.loadedModules.get("wb-dashboard").instance.login(log, msg.author);
    const m = (typeof verified == "string")
      ? "Login failed! Reason: `" + verified + "`. If this is an error and the issue persist, please contact a team member through the server in my description."
      : (verified == true) ? "Login succeeded! You can continue to the webpage now." : "An unknown error occured. Please contact a team member if this issue persists!";
    msg.reply(this.em(m, msg), false);
  }
}
