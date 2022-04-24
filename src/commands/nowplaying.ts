import { Message } from "revolt.js/dist/maps/Messages";

export const name = "nowplaying";
export const aliases = ["np"];
export const description = "Under development >:|";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const botMsg = await msg.channel?.sendMessage("NowPlaying");
	botMsg?.edit({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "NowPlaying",
				description: `Remix bot is under development >:|`,
				colour = "#e9196c";,
			},
		],
	});
}
