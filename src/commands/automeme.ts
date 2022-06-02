import { Message } from "revolt.js/dist/maps/Messages";
import fetch from 'node-fetch';

export const name = "automeme";
export const aliases = ["am"];
export const description = "Gives you automemes.";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
    let question = args[0];
    if (!question)
        return msg.reply("I hope you do this from a channel dedicated to Memes, The Memes don't stop! Except for when the bot restarts or shuts down for any apparent reason, use the startup command (`%automeme start.`) again");
    const subreddit = [
        'dankmemes',
        'memes',
        'HolUp',
        'BlackPeopleTwitter',
        'comedyhomicide',
        'SpecialSnowflake',
        'dank_meme',
        'pewdiepie',
        'KSI'
    ];
    const rndSr = subreddit[Math.floor(Math.random() * subreddit.length)];
    const url = await fetch(`https://www.reddit.com/r/${rndSr}/random/.json`);
    const random = await url.json();
       msg.reply("🔄 **| AutoMeme Starting... (`Please wait 5m`)**")
    setInterval(() => {
       msg.channel?.sendMessage({
            content: (random[0].data.children[0].data.url),
        }).catch(e => {
            console.error('' + e);
            msg.reply('Something went wrong: 🔒 Missing permission');
        });
    }, 300000);
}
;
