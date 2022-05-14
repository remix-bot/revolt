import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "8ball";
export const aliases = ["8ball"];
export const description = "Tells you a fortune.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {
 var responses = [
      "Yes.",
      "It is certain.",
      "It is decidedly so.",
      "Without a doubt.",
      "Yes definelty.",
      "You may rely on it.",
      "As I see it, yes.",
      "Most likely.",
      "Outlook good.",
      "Signs point to yes.",
      "Reply hazy, try again.",
      "Ask again later.",
      "Better not tell you now...",
      "Cannot predict now.",
      "Concentrate and ask again.",
      "Don't count on it.",
      "My reply is no.",
      "My sources say no.",
      "Outlook not so good...",
      "Very doubtful.",
      "My reply is no.",
    ]
        let question = args[0]
        let result = Math.floor((Math.random() * responses.length))
        if (!question) return msg.reply("Please ask a question")
  const avatarUrl = `https://autumn.revolt.chat/avatars/${msg.author?.avatar?._id}/${msg.author?.avatar?.filename}`;
  msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                icon_url: `${avatarUrl}`,
                description: `${responses[result]}`,
                colour: strings.embeds.accent,
            },
               ]
    }).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;