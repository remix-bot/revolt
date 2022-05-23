import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "stats";
export const aliases = ["info", "botinfo"];
export const description = "stats!";
export const category = "Misc";
export const developer = false;
export const serverOnly = false;
export async function run(msg: Message, args: string[]) {

 msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `Stats:`,
                description: (`
**Server**\n\`${msg.client.servers.size}\`\n**Users (Unavailable)**\n\`Null\`
`),
                colour: strings.embeds.accent,
            },
        ]
    }).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;