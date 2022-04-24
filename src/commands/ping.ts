import { Message } from "revolt.js/dist/maps/Messages";

export const name = "ping";
export const aliases = ["pong"];
export const description = "Pong!";
export const category = "Misc";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
    const botMsg = await msg.channel?.sendMessage("Fetching Latency...");
    botMsg?.edit({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: "Pong! 🏓",
                description: `${botMsg.createdAt - msg.createdAt}ms`,
                colour: "#e9196c"
			},
        ]
    });
}
;