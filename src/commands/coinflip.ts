import { Message } from "revolt.js/dist/maps/Messages";

export const name = "coinflip";
export const aliases = ["toss", "flip"];
export const description = "Lempar Coin!";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
        const acceptedReplies = ['heads', 'tails', 'center'];
        const SummaryResponses = ['Okey Dokey! Just flipped my lucky quarter and got', 'Alright, I flipped a coin, looks like I got', 'Just flipped a coin and it fell on', 'I flipped a coin and got']
        const random = Math.floor((Math.random() * acceptedReplies.length));
        const result = acceptedReplies[random];

        const choice = args[0];
        if (!choice) return msg.channel?.sendMessage(`How to play: %coinflip <Heads|Tails|Center>`);
        if (!acceptedReplies.includes(choice)) return msg.channel?.sendMessage(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
    
        switch (choice) {
            case 'heads': {
                if (result == 'tails') return msg.reply(`${SummaryResponses[random]} **${result}**`);
            }
            case 'tails': {
                if (result == 'center') return msg.reply(`${SummaryResponses[random]} **${result}**`);
            }
            case 'center': {
                if (result == 'heads') return msg.reply(`${SummaryResponses[random]} **${result}**`);
            }
            default: {
                return msg.channel?.sendMessage(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
            }
        }
    }
;
