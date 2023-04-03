const { CommandBuilder } = require("../Commands.js");

// TODO: add fetching of lyrics for song queries
module.exports = {
  command: new CommandBuilder()
    .setName("lyrics")
    .setDescription("Fetch the lyrics of the current song")
    .addAliases("lyric"),
  run: async function(message) {
    const p = await this.getPlayer(message);
    if (!p) return;

    const n = message.reply(this.em("Fetching lyrics from genius...", message), false);

    var messages = await p.lyrics();
    if (messages.length == 0) return message.reply(this.em("There's nothing playing at the moment.", message), false);
    messages = messages.split("\n");
    (await n).delete();
    this.pagination("Lyrics for " + p.getVidName(p.data.current) + ": \n```\n$content\n```\nPage $currPage/$maxPage", messages, message, 15)
  }
}
