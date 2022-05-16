import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "sus";
export const aliases = ["sustest", "sussuy"];
export const description = "sus percentage.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {
const avatarUrl = `https://i.imgur.com/Mo1zAsN.png`;
const mentionedUser = msg.mention_ids
        ? msg.client.users.get(msg.mention_ids[0])
        : null;
const sus = Math.round(Math.random() * 100);
const susIndex = Math.floor(sus / 10);
const susLevel = ":ubertroll:".repeat(susIndex) + ":troll_smile:".repeat(10 - susIndex);
  
  msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `SUS Percentage:`,
                icon_url: `${avatarUrl}`,
                description: (`${mentionedUser ? `${mentionedUser.username}` : "This"} is how sus you are :trol:: \`${sus}%\`\n\n${susLevel}`),
                colour: strings.embeds.accent,
            },
        ]
    }).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;