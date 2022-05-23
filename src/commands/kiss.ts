import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch'

export const name = "kiss";
export const aliases = ["sendkiss"];
export const description = "Get naughty and just kiss the person!";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
const url = await fetch('http://api.nekos.fun:8080/api/kiss')
const random = await url.json();
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[💋](${random.image}) | Kissing ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;