import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch';

export const name = "slap";
export const aliases = ["sendslap"];
export const description = "Who's being naughty? Give them a tight slap";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
const url = await fetch('http://api.nekos.fun:8080/api/slap')
const random = await url.json();
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[🖐](${random.image}) | Slapping ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;
