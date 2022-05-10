import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "count";
export const aliases = ["counting"];
export const description = "counting.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {
 const countGame = new Set();
  let num = parseInt(args[0]);
    if (!num) return msg.channel?.sendMessage(`Usage: \`%count <num>\``);

    // If a game doesn't exist, add user to the Set and send message that a new game started
    if (countGame.size === 0) {
        if (num !== 1) return msg.channel?.sendMessage(`The game must start at **1**!`);
        await countGame.add(msg.author.id);
        return msg.channel?.sendMessage(`**${msg.author.username}** has started a game! Current count is at **${countGame.size}**.`);
    // Is user enters incorrect number, end the game (clear the Set)
    } else if (num !== countGame.size + 1) {
        countGame.clear();
        return msg.channel?.sendMessage(`:frowning: **${msg.author.username}** has ended the game by entering **${num}**.`);
    // If a game is ongoing, add user to the Set
    } else {
        await countGame.add(msg.author.id);
        return msg.channel?.sendMessage(`**${msg.author.username}}** has counted! Game is now at **${countGame.size}**.`);
    }

}
;