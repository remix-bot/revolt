import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch';

export const name = "hug";
export const aliases = ["sendhug"];
export const description = "Someone needs a hug? Why wait, just give it!";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
const url = await fetch('http://api.nekos.fun:8080/api/hug')
const random = await url.json();
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[🤗](${random.image}) | Hugging ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;
