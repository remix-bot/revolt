const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("player")
    .setDescription("Create an emoji player control for your voice channel"),
  run: async function(msg) {
    const p = await this.getPlayer(msg);
    if (!p) return;

    const Timeout = this.config.playerAFKTimeout || 10 * 6000;

    const controls = ["▶️", "⏸️", "⏭️", "🔁", "🔀"];
    const form = "Currently Playing: $current\n\n$lastMsg";
    var em = this.embedify(form.replace(/\$current/gi, p.getCurrent()).replace(/\$lastMsg/gi, "Control updates will appear here"));
    msg.reply({
      content: " ",
      embeds: [em],
      interactions: {
        restrict_reactions: true,
        reactions: controls
      }
    }, false).then((m) => {
      var suspensionTimeout = setTimeout(() => close(), Timeout);

      var lastUpdate = "Control updates will appear here";
      const update = (s=lastUpdate) => {
        em = this.embedify(form.replace(/\$current/gi, p.getCurrent()).replace(/\$lastMsg/gi, s))
        m.edit({ embeds: [ em ]});
        lastUpdate = s;
      }
      const close = () => {
        this.unobserveReactions(oid);
        m.edit({
          content: "Player Session Closed",
          embeds: [
            this.embedify(em.description + "\n\nSession Closed. The player controls **won't respond** from here.", "red")
          ]
        });
      }
      p.on("message", () => {
        update();
      });
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
        clearTimeout(suspensionTimeout);
        suspensionTimeout = setTimeout(() => {
          close();
        }, Timeout);
        update(reply);
      });
    });
  }
}
