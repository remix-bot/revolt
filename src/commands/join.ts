import { strings } from "../i18n/en_GB";

export const name = "join";
export const aliases = ["voice"];
export const description = "Joins the provided channel.";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {

let question = args[0];
    if (!question)
        return msg.reply("Please type first <channel id/mention>");
const channel = msg.client.channels.get(args[0])
console.log(await channel.joinCall(), 'JOINED');
msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: "Joining:",
                description: `Okay! I joined **${channel?.name}**.`,
                colour: strings.embeds.accent,
            },
        ],
    }).catch(e => {
        console.error('' + e);
        msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;
