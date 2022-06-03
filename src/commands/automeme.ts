import { Message } from 'revolt.js/dist/maps/Messages';
import got from 'got';

export const name = 'automeme';
export const aliases = ['am'];
export const description = 'Gives you automemes.';
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
  let question = args[0];
   if (!question)
    return msg.reply('I hope you do this from a channel dedicated to Memes, The Memes don\'t stop! Except for when the bot restarts or shuts down for any apparent reason, use the startup command (`%automeme start.`) again');
   msg.reply('🔄 **| AutoMeme Starting... (`Please wait 10m`)**')

    setInterval(() => {
	    const subreddit = [
		    'dankmemes',
		    'memes',
		    'HolUp',
		    'BlackPeopleTwitter',
		    'comedyhomicide',
		    'SpecialSnowflake',
	    ];
	    const rndSr = subreddit[Math.floor(Math.random() * subreddit.length)];
      got(`https://www.reddit.com/r/${rndSr}/random/.json`).then(response => {
        const [list] = JSON.parse(response.body);
        const [post] = list.data.children;

        const permalink = post.data.permalink;
        const memeUrl = `https://reddit.com${permalink}`;
        const memeImage = post.data.url;
        const memeTitle = post.data.title;
         msg.channel?.sendMessage({
           content: 
             (`[${memeTitle}](${memeImage})`),
         }).catch(e => {
           console.error('' + e);
            msg.reply('Something went wrong: 🔒 Missing permission');
         });
      })
    }, 600000);
}
;
