import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch';

export const name = "starwarsmeme";
export const aliases = ["swm"];
export const description = "Gives you starwarsmemes.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {
const subreddit = [
  'starwarsmeme',
  'PrequelMemes'
]
const rndSr = subreddit[Math.floor(Math.random()* subreddit.length)] 
const url = await fetch(`https://www.reddit.com/r/${rndSr}/random/.json`);
      const random = await url.json();
  msg.channel?.sendMessage({
        content: (random[0].data.children[0].data.url),
	}).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;
