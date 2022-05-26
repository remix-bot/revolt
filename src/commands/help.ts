import { Message } from "revolt.js/dist/maps/Messages";
import { Command } from "../types/command.js";
import { config } from "../config.js";
import { getCommand } from "../modules/functions.js";

export const name = "help";
export const aliases = ["h"];
export const description =
	"Returns a list of the bot's commands or, if a command is specified, info about the command.";
export const usage = "help [command]";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const input = args.join(" ");
	const authorIsDev = config.developers.includes(msg.author_id);
	const title = `${msg.client.user?.username} Help\n`;
	let content = "";
	let colour = "#e9196c";
	if (!input) {
		// @ts-expect-error - whilst this code works, `framework` is not in the Client object's types
		for (const cmd of msg.client.framework.commands) {
			if (cmd.developer && !authorIsDev) continue;
			content += `\`${config.prefix}${cmd.name}\` `;
		}
	} else {
		// @ts-expect-error - see above
		const cmd: Command = getCommand(input, msg.client.framework);
		if (!cmd) {
			colour = "#e9196c";
			content =
				"**Command not found**\nThat doesn't seem to be a command - have you spelt the command's name correctly?";
		} else {
			content +=
				`**${cmd.name}**\n\`${cmd.description || "No description."}\`\n\n` +
				`**Usage**\n\`${config.prefix}${cmd.usage || cmd.name}\`\n\n` +
				`**Aliases**\n\`${cmd.aliases.join("`, `")}\``;
		}
	}
	msg.channel?.sendMessage({
		content: " ",
		embeds: [{ type: "Text", title, description: content, colour }],
	});
}
