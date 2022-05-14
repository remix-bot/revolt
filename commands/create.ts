import { Message } from "revolt.js/dist/maps/Messages";
import { ulid } from "ulid";

export const name = "create";
export const aliases = ["channel", "newchannel"];
export const description = "Creates a new channel.";
export const usage = "create <text|voice> <name> [description]";
export const developer = false;
export const serverOnly = true;

export async function run(msg: Message, args: string[]) {
	// initial checks
	if (!args[0])
		return msg.channel?.sendMessage(
			"# Missing arguments\nPlease specify a channel type (`text` or `voice`), a channel name and (optionally) a description."
		);

	// arg checks
	const type = args[0].charAt(0).toUpperCase() + args[0].slice(1);
	if (type !== ("Text" || "Voice"))
		return msg.channel?.sendMessage(
			"# Argument error\nThe channel type is the first arg - make sure it's either `text` or `voice`."
		);
	if (!args[1])
		return msg.channel?.sendMessage(
			"# Argument error\nPlease specify a name for your channel. For now, we don't support spaces in channel names - use hyphens instead."
		);
	try {
		const name = args[1];
		const description = args[2] ?? "";
		const nonce = ulid();

		await msg.channel?.server?.createChannel({
			type,
			name,
			description,
			nonce,
		});
		msg.channel?.sendMessage(
			`# Channel created!\nCheck it out: <#${nonce}>`
		);
	} catch (error) {
		if (error === "Error: Request failed with status code 403")
			msg.channel?.sendMessage(
				"# Permission error\nMake sure the bot has a role with the `Manage Channels` permission."
			);
		msg.channel?.sendMessage(
			`# Something went wrong!\nSomething broke. Here's the error:\n\`\`\`${error}\`\`\``
		);
	}
}
