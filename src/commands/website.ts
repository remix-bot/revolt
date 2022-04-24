import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "website";
export const aliases = ["web"];
export const description = "The website bot.";
export const category = "Misc";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args) {
    const botMsg = await msg.channel?.sendMessage("Web");
    botMsg?.edit({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: "Website:",
                description: `https://remixbot.cf`,
                colour: strings.embeds.accent,
            },
        ]
    });
}
;
