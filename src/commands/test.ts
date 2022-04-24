import { Message } from "revolt.js/dist/maps/Messages";
import prettyMilliseconds from 'pretty-ms';
import { stripIndents } from 'common-tags';
export const name = "test";
export const aliases = ["tt"];
export const description = "Testing!";
export const category = "Fun";
export const developer = true;
export const serverOnly = false;
export async function run(msg, args, client) {
        let question = args[0]
        
        if (!question) return msg.reply("Please type first")
        msg.channel?.sendMessage(`${args.join(" ")}`)
    
}
;