import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "say";
export const aliases = ["talk"];
export const description = "say.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
  let question = args[0]
        if (!question) return msg.reply("Please type first")
    const avatarUrl = `https://autumn.revolt.chat/avatars/${msg.author?.avatar?._id}/${msg.author?.avatar?.filename}`;

  msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `${msg.author.username} Says:`,
                icon_url: `${avatarUrl}`,
                description: `${args.join(" ")}`,
                colour: strings.embeds.accent,
                delete: msg.delete().catch(e => {
  console.error('' + e);
 msg.reply('Something went wrong: 🔒 Missing permission');
                }),
            },
        ] 
    });
}
;