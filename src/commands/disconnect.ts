import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "disconnect";
export const aliases = ["dc"];
export const description = "Under development >:|";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
	const botMsg = await msg.channel?.sendMessage("Disconnects");
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Disconnects",
				description: `Remix bot is under development >:|`,
				colour: strings.embeds.accent,
			},
		],
	});
}
