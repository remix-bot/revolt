import { Message } from "revolt.js/dist/maps/Messages";

import { strings } from "../i18n/en_GB"; // `const { strings } = await import(langName);` for proper i18n support?

export const name = "ping";
export const aliases = ["pong"];
export const description = strings.ping.description;
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const botMsg = await msg.channel?.sendMessage(strings.ping.pong);
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: strings.ping.pong,
				description: `This took ${botMsg.createdAt - msg.createdAt}ms.`,
				colour: strings.embeds.accent,
			},
		],
	});
}
