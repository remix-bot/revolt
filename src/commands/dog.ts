import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch';

export const name = "dog";
export const aliases = ["puppy"];
export const description = "Dogs Photo.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
const url = await fetch("https://www.reddit.com/r/dog/random/.json");
      const random = await url.json();
    const botMsg = await msg.channel?.sendMessage("Puppy");
    botMsg?.edit({
        content: (random[0].data.children[0].data.url),
    });
}
;