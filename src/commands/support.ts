import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "support";
export const aliases = ["sp"];
export const description = "Support Server.";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const botMsg = await msg.channel?.sendMessage("Support");
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Support",
				description: `Support Server: https://app.revolt.chat/invite/qvJEsmPt.`,
				colour: strings.embeds.accent,
			},
		],
	});
}
