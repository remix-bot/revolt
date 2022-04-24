import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "skip";
export const aliases = ["s"];
export const description = "Under development >:|";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const botMsg = await msg.channel?.sendMessage("Skip");
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Skip",
				description: `Remix bot is under development >:|`,
				colour: strings.embeds.accent,
			},
		],
	});
}
