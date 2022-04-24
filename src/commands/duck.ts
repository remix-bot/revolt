import { Message } from "revolt.js/dist/maps/Messages";
export const name = "Duck";
export const aliases = ["Quack"];
export const description = "Ducks Photo.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
import fetch from 'node-fetch';
export async function run(msg, args, client) {
const url = await fetch("https://www.reddit.com/r/duck/random/.json");
      const random = await url.json();
    const botMsg = await msg.channel?.sendMessage("Here's your duck!");
    botMsg?.edit({
        content: (random[0].data.children[0].data.url),
        embeds: [
            {
                colour: "#e9196c"
            },
        ]
    });
}
;
