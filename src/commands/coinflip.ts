import { Message } from "revolt.js/dist/maps/Messages";

export const name = "coinflip";
export const aliases = ["toss", "flip"];
export const description = "Lempar Coin!";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
const acceptedReplies = ['heads', 'tails', 'center'];
        const random = Math.floor((Math.random() * acceptedReplies.length));
        const result = acceptedReplies[random];

        const choice = args[0];
        if (!choice) return msg.channel?.sendMessage(`How to play: %coinflip <Heads|Tails|Center>`);
        if (!acceptedReplies.includes(choice)) return msg.channel?.sendMessage(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
    
        switch (choice) {
            case 'heads': {
                if (result === 'tails') return msg.reply(`It's **${result}**`);
            }
            case 'tails': {
                if (result === 'center') return msg.reply(`It's **${result}**`);
            }
            case 'center': {
                if (result === 'heads') return msg.reply(`It's **${result}**`);
            }
            default: {
                return msg.channel?.sendMessage(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
            }
        }
    }
;