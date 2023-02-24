const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("player")
    .setDescription("Create an emoji player control for your voice channel"),
  run: async function(msg, data) {
    const p = await this.getPlayer(msg);
    if (!p) return;

    const controls = ["▶️", "⏸️", "⏭️", "🔁", "🔀"];
    const form = "Currently Playing: $current\n\n$lastMsg";
    msg.reply({
      content: " ",
      embeds: [this.embedify(form.replace(/\$current/gi, p.getCurrent()).replace(/\$lastMsg/gi, "Control updates will appear here"))],
      interactions: {
        restrict_reactions: true,
        reactions: controls
      }
    }, false).then((m) => {
      const update = (s) => {
        m.edit({ embeds: [ this.embedify(form.replace(/\$current/gi, p.getCurrent()).replace(/\$lastMsg/gi, s)) ]});
      }
      const oid = this.observeReactions(m, controls, (e, ms) => {
        var reply = "";
        switch (e.emoji_id) {
          case controls[0]:
            reply = p.resume(true) || "Successfully Resumed";
            break;
          case controls[1]:
            reply = p.pause(true) || "Successfully Paused";
            break;
          case controls[2]:
            reply = p.skip(true) || "Successfully Skipped";
            break;
          case controls[3]:
            reply = p.loop("queue", true);
            break;
          case controls[4]:
            reply = p.shuffle(true) || "Successfully shuffled";
            break;
        }
        update(reply);
      });
    });
  }
}
