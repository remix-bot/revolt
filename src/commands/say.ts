import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "say";
export const aliases = ["talk"];
export const description = "say.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {
 let question = args[0]
        if (!question) return msg.reply("Please type first")
  msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `${msg.author.username} Says:`,
                description: `${args.join(" ")}`,
                colour: strings.embeds.accent,
                delete: msg.delete().catch(err => {
             // msg.channel?.sendMessage("# Permission error\nMake sure the bot has a role with the Manage Channels permission." + err);
                }),
            },
        ]
      
    });
}
;