const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("test")
    .setDescription("A test command used for various purposes.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ).addNumberOption(o =>
      o.setName("number")
        .setRequired(true)),
  run: function(msg, data) {
    /*const arrows = ["⬅️", "➡️"];
    var page = data.get("number").value;
    msg.reply({
      content: this.paginate("test\ntest1\ntest2\ntest3\ntest4", 2, data.get("number").value).join("\n"),
      interactions: {
        restrict_reactions: true,
        reactions: arrows
      }
    }, false).then(m => {
      const oid = this.observeReactions(m, arrows, (e, ms) => {
        let change = (e.emoji_id == arrows[0]) ? -1 : 1;
        page += change;
        const c = this.paginate("test\ntest1\ntest2\ntest3\ntest4", 2, page).join("\n");
        if (!c) return page -= change;
        ms.edit({ content: c });
        //m.clearReactions();
      });
    })*/
    this.pagination("This is a paginated list (page $currPage/$maxPage):\n\n$content", "test\ntest1\ntest2\ntest3\ntest4", msg)
  }
}
