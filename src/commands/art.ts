import { Message } from "revolt.js/dist/maps/Messages";
export const name = "art";
export const aliases = ["at"];
export const description = "Arts Photo.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
import fetch from 'node-fetch';
export async function run(msg, args, client) {
const url = await fetch("https://www.reddit.com/r/art/random/.json");
      const random = await url.json();
    const botMsg = await msg.channel?.sendMessage("Art's");
    botMsg?.edit({
        content: (random[0].data.children[0].data.url),
    });
}
;
