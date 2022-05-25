import { Message } from "revolt.js/dist/maps/Messages";

export const name = "RockPaperScizzor";
export const aliases = ["rps"];
export const description = "RockPaperScizzor.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
const acceptedReplies = ['rock', 'paper', 'scissors'];
        const random = Math.floor((Math.random() * acceptedReplies.length));
        const result = acceptedReplies[random];

        const choice = args[0];
        if (!choice) return msg.channel?.sendMessage(`How to play: %rps <rock|paper|scissors>`);
        if (!acceptedReplies.includes(choice)) return msg.channel?.sendMessage(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
        
        if (result === choice) return msg.reply(`I pick **${result}** It's a tie! We had the same choice.`);
        
        switch (choice) {
            case 'rock': {
                if (result === 'paper') return msg.reply(`I pick **${result}** I won!`);
                else return msg.reply(`I pick **${result}**, You won!`);
            }
            case 'paper': {
                if (result === 'scissors') return msg.reply(`I pick **${result}** I won!`);
                else return msg.reply(`I pick  **${result}**, You won!`);        
            }
            case 'scissors': {
                if (result === 'rock') return msg.reply(`I pick **${result}** I won!`);
                else return msg.reply(`I pick **${result}**, You won!`);
            }
            default: {
                return msg.channel?.sendMessage(`Only these responses are accepted: \`${acceptedReplies.join(', ')}\``);
            }
        }
    }
;