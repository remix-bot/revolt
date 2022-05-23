import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch'

export const name = "pat";
export const aliases = ["sendpat"];
export const description = "Pat your homie";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
const url = await fetch('http://api.nekos.fun:8080/api/pat')
const random = await url.json();
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[:pat:](${random.image}) | Patting ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;