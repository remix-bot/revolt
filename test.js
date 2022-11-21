function calcMatch(word, base, insensitive=true) {
  insensitive = (insensitive) ? "i" : "";
  let matching = 0;
  let used = [];
  word.split("").forEach(c => {
    if (used.includes(c)) return;
    let m = base.match(new RegExp(c, "g" + insensitive));
    used.push(c);
    if (m === null) return;
    matching += m.length;
  });
  return matching / base.length;
}
const { Client } = require("revolt.js");
const { CommandHandler, CommandBuilder } = require("./Commands.js");
const config = require("./config.json");

const client = new Client();
client.config = config;

const handler = new CommandHandler(client);

const command = new CommandBuilder()
  .setName("test")
  .setDescription("This is a test command")
  .addSubcommand(cmd =>
    cmd.setName("name")
      .setDescription("test description")
  ).addSubcommand(cmd =>
    cmd.setName("hi")
      .setDescription("another description")
  );
handler.addCommand(command);
handler.on("run", (data) => {
  console.log(data);
});

console.log(handler);

client.loginBot(config.token);
