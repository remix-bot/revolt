import { Message } from 'revolt.js/dist/maps/Messages';
import fetch from 'node-fetch';

export const name = 'nsfw';
export const aliases = [];
export const description = 'lol';
export const category = 'NSFW';
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
  if (!msg.channel.nsfw) return msg.reply(`This <#${msg.channel._id}> channel is not an NSFW marked channel!, You trynna get me in trouble?`)
  const acceptedReplies = ['hentai', 'boobs', 'ass'];
  const choice = args[0];
  if (!choice) return msg.channel?.sendMessage(`How to play: %nsfw <hentai|boobs|there is more to come just wait>`);
  if (!acceptedReplies.includes(choice)) return msg.channel?.sendMessage(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
  
  switch (choice) {
    case 'hentai': {
      const hentai = [
        'hentai',
        'HENTAI_GIF',
        'hentaiwaifus69'
      ];
      const hentaiSr = hentai[Math.floor(Math.random() * hentai.length)];
      const url = await fetch(`https://www.reddit.com/r/${hentaiSr}/random/.json`);
      const random = await url.json();
      return msg.reply(
        random[0].data.children[0].data.url,
        false
      )
    }
    case 'boobs': {
      const boobies = [
        'Boobies',
        'boobgifs',
        'smallboobs',
        'TittyDrop'
      ]
      const boobsSr = boobies[Math.floor(Math.random() * boobies.length)]
      const url = await fetch(`https://www.reddit.com/r/${boobsSr}/random/.json`);
      const random = await url.json();
      return msg.reply(
        random[0].data.children[0].data.url,
        false
      )
    }
  }
}
