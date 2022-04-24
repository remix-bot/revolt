import { Message } from "revolt.js/dist/maps/Messages";

export const name = "play";
export const aliases = ["p"];
export const description = "Under development >:|.";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const botMsg = await msg.channel?.sendMessage("Play");
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Play:",
				description: `This command is under development >:|`,
				colour = "#e9196c";,
			},
		],
	});
}
