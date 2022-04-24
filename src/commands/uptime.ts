import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";
import prettyMilliseconds from 'pretty-ms';

export const name = "uptime";
export const aliases = ["up"];
export const description = "Uptime!";
export const category = "Misc";
export const developer = true;
export const serverOnly = false;
export async function run(msg, args, client) {

    const botMsg = await msg.channel?.sendMessage("Uptime");
    botMsg?.edit({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `Uptime:`,
                description: (`${prettyMilliseconds(Math.round(process.uptime()) * 1000)}`),
                colour: strings.embeds.accent,
            },
        ]
    });
}
;
