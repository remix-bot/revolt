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
const Uploader = require("revolt-uploader");
const config = require("./config.json");

const client = new Client();
client.config = config;

const uploader = new Uploader(client);

const handler = new CommandHandler(client);
handler.setReplyHandler((t, msg) => {
  msg.reply({ content: "", embeds: [{
      type: "Text",
      description: t,
      colour: "#e9196c",
    }
  ]})
});

const command = new CommandBuilder()
  .setName("test")
  .setDescription("This is a test command")
  .addSubcommand(cmd =>
    cmd.setName("name")
      .setDescription("test description")
      .setId("first")
  ).addSubcommand(cmd =>
    cmd.setName("hi")
      .setDescription("another description")
      .addSubcommand(cmd =>
        cmd.setName("Hello")
          .setDescription("This is a sub-sub-command")
          .setId("second")
          .addStringOption(opt =>
            opt.setName("Some string")
              .setDescription("It's just a string!"))
          .addTextOption(opt =>
            opt.setName("text")
              .setDescription("some text input"))
          .addNumberOption(opt =>
            opt.setName("number")
              .setDescription("Just enter a random number ._.")
          )
      ).addSubcommand(cmd =>
        cmd.setName("hellol")
          .setDescription("I'm tired of descriptions...")
          .setId("third")
      )
  );
handler.addCommand(command);
handler.on("run", async (data) => {
  data.message.reply("id: " + data.commandId + " values: " + data.options.map(e => e.value).join(" "));
  if (data.commandId != "first") return;
  let opts = { attachments: [ await uploader.upload("test.js") ] };
  console.log(data.commandId, opts);
  data.message.channel.sendMessage({ content: "test", ...opts})
});

console.log(handler);

client.loginBot(config.token);
