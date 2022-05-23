import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch'

export const name = "cuddle";
export const aliases = ["sendcuddle"];
export const description = "Wanna feel warm? Cuddle with them <3";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
const url = await fetch('http://api.nekos.fun:8080/api/cuddle')
const random = await url.json();
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[🫂](${random.image}) | Cuddling ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;
