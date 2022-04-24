import { Message } from "revolt.js/dist/maps/Messages";
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
    const botMsg = await msg.channel?.sendMessage("Howgay");
    botMsg?.edit({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `Gay test:`,
                description: (`${mentionedUser ? `${mentionedUser.username} is` : "You're"} ${rng}% Gay🌈`),
                colour: "#e9196c"
            },
        ]
    });
}
;
