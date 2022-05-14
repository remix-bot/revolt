import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "howgay";
export const aliases = ["gay"];
export const description = "Gay test.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
import fetch from 'node-fetch';
export async function run(msg, args, client) {
let rng = Math.floor(Math.random() * 101);
 const mentionedUser = msg.mention_ids        ? msg.client.users.get(msg.mention_ids[0])        : null;

const avatarUrl = `https://autumn.revolt.chat/avatars/${msg.author?.avatar?._id}/${msg.author?.avatar?.filename}`;
  msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `Gay Test:`,
                icon_url: `${avatarUrl}`,
                description: (`${mentionedUser ? `${mentionedUser.username} is` : "You're"} ${rng}% Gay🌈`),
                colour: strings.embeds.accent,
            },
        ]
    }).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;