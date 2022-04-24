import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "pause";
export const aliases = ["stop"];
export const description = "Under development >:|";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
	const botMsg = await msg.channel?.sendMessage("Pause");
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Pause",
				description: `Remix bot is under development >:|`,
				colour: strings.embeds.accent,
			},
		],
	});
}