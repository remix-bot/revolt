const { CommandBuilder } = require("../Commands.js");

function e(expression) {
  return new Promise(async res => {
    const clean = async (text) => {
      // If our input is a promise, await it before continuing
      if (text && text.constructor.name == "Promise") text = await text;

      const removeSensitive = (obj, level=0) => {
        if (level == 2) return obj;
        obj = { ...obj };
        level++;
        for (key in obj) {
          switch (key) {
            case "revolt":
            case "vapid":
            case "config":
            case "key":
            case "clientSecret":
            case "clientId":
              obj[key] = null;
            default:
              break;
          }
          if (typeof obj[key] === "object") obj[key] = removeSensitive(obj[key], level);
        }
        return obj;
      }
      if (typeof text == "object") text = removeSensitive({ ...text });

      // If the response isn't a string, `util.inspect()`
      // is used to 'stringify' the code in a safe way that
      // won't error out on objects with circular references
      // (like Collections, for example)
      if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });

      // Replace symbols with character code alternatives
      text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));

      // Send off the cleaned up result
      return text;
    }

    try {
      const evalued = eval(expression);

      const cleaned = await clean(evalued);
      res(("Expression returned: \n```js\n" + cleaned).slice(0, 1900) + "\n```");
    } catch(e) {
      res(("Expression returned an error: \n```js\n" + (await clean(e))).slice(0, 1900) + "\n```");
    }
  });
}

module.exports = {
  command: new CommandBuilder()
    .setName("eval")
    .setDescription("eval() function; dev only")
    .addRequirement(r => r.setOwnerOnly(true))
    .addTextOption(o =>
      o.setName("expression")
        .setDescription("The expression to execute")
        .setRequired(true)
    ),
  run: async function(msg, data) {
    const expression = data.get("expression").value;
    msg.reply(await e.call(Object.assign({}, this), expression));
  }
}
