import { Message } from "revolt.js/dist/maps/Messages";
import { Command, Context } from "../types/command";
import { strings } from "../i18n/en_GB";
import { BotFramework } from "./framework";

export function isValidContext(msg: Message, bot: BotFramework): Context {
	let values: Context = { command: null, args: [], canExecute: false };

	// ignore system messages
	if (typeof msg.content !== "string") return values;

	// if someone mentions the bot at the start of a message, reply to them with the prefix
	const prefixMention = new RegExp(`^<@!?${bot.client.user!._id}>.*$`);

	const botPinged = prefixMention.test(msg.content);
	if (botPinged)
		msg.channel?.sendMessage(strings.help.pingPrefix(bot.prefix));

	if (!msg.content.startsWith(bot.prefix)) return values;

	const args = msg.content.slice(bot.prefix.length).split(" ");
	const commandName = args.shift();
	const command: Command = getCommand(commandName as string, bot);
	values.command = command;
	values.args = args;

	if (!command) return values;

	const issues = commandChecks(msg, command, bot);

	if (!issues) values.canExecute = true;
	return values;
}

export function commandChecks(
	msg: Message,
	command: Command,
	bot: BotFramework
) {
	if (
		!msg.author?._id ||
		(command.developer && !bot.developers.includes(msg.author._id))
	) {
		msg.channel?.sendMessage(strings.errors.devOnlyCommand);
		return true;
	} else if (command.serverOnly && !msg.channel?.server) {
		msg.channel?.sendMessage(strings.errors.serverOnlyCommand);
		return true;
	} else return false;
}

export function getCommand(value: string, bot: BotFramework) {
	return bot.commands.find(
		(cmd) => cmd.name === value || cmd.aliases.includes(value)
	);
}
