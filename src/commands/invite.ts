import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "invite";
export const aliases = ["inv"];
export const description = "Invite the bot to you're server.";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
	const botMsg = await msg.channel?.sendMessage("Invite");
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Invite",
				description: `https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW`,
				colour: strings.embeds.accent,
			},
		],
	});
}