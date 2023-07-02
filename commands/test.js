const { CommandBuilder } = require("../Commands.js");

module.exports = {
  command: new CommandBuilder()
    .setName("test")
    .setDescription("A test command used for various purposes.")
    .addRequirement(r =>
      r.setOwnerOnly(true)
    ).addUserOption(o =>
      o.setName("user")
        .setDescription("A user")),
  run: async function(msg, _data) {
    const categories = [{ // TODO: improve this text
      reaction: "🏠",
      content: `# Home\n
      Welcome to Remix' help.\n
      Remix is Revolt's first open-source music bot. It supports a variety of streaming services and has many features,
      with one of the newest being the [Web Dashboard](https://remix.fairuse.org/).\n\n
      We hope you enjoy using Remix!\n\n
      To get started, just click on the reactions below to find more about the commands.`,
      form: "$content\n\n###### Page $currPage/$maxPage",
      title: "Home Page"
    }, {
      reaction: "💻",
      content: ["c", "c2", "c3"],
      form: "List page $currPage/$maxPage: \n\n$content"
    }]; // TODO: add status page
    this.catalog(msg, categories, 0, 15)
  }
}
