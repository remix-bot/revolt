import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch';
import { strings } from "../i18n/en_GB";

export const name = "art";
export const aliases = ["at"];
export const description = "Arts Photo.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
const url = await fetch("https://www.reddit.com/r/art/random/.json");
      const random = await url.json();
  msg.channel?.sendMessage({
        content: (random[0].data.children[0].data.url),
	}).catch(err => {
            // msg.channel?.sendMessage("# Permission error\nMake sure the bot has a role with the Manage Channels permission." + err);
                });
}
;
