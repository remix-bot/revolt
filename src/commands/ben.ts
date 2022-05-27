import { Message } from 'revolt.js/dist/maps/Messages';

export const name = 'ben';
export const aliases = ['talkingben'];
export const description = 'Talk With Ben';
export const usage = "ben ask a question bruh :moyai:";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
  const benResponses = [
    '[🐕 | Yes](https://media.discordapp.net/attachments/970069401200115723/978805957624754226/benyes.mp4)',
    '[🐕 | No](https://media.discordapp.net/attachments/970069401200115723/978753155045130251/benno.mp4)',
    '[🐕 | Ho Ho Ho](https://media.discordapp.net/attachments/970069401200115723/978806204207861831/benhoho.mp4)',
    '[🐕 | Ughh](https://media.discordapp.net/attachments/970069401200115723/978805736220000296/benuhh.mp4)'
  ];
  let question = args[0];
  let result = Math.floor((Math.random()* benResponses.length));
  if (!question) return msg.reply('ask a question bruh :moyai:');
  msg.channel?.sendMessage(benResponses[result]).catch(e => {
    console.error('' + e);
    msg.reply('Something went wrong: 🔒 Missing permission');
  })
}
;
