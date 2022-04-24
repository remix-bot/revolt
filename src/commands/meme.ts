import { Message } from "revolt.js/dist/maps/Messages";

export const name = "meme";
export const aliases = ["pog"];
export const description = "Gives you memes.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
import fetch from 'node-fetch';
export async function run(msg, args, client) {
const url = await fetch("https://www.reddit.com/r/meme/random/.json");
      const random = await url.json();
    const botMsg = await msg.channel?.sendMessage("Meme");
    botMsg?.edit({
        content: (random[0].data.children[0].data.url),
    });
}
;