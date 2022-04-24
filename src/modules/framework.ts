import { Client } from "revolt.js";
import { Message } from "revolt.js/dist/maps/Messages";
import { commands } from "./commands.js";
import { Context, Command } from "../types/command.js";
import { statuses } from "../statuses.js";

export class BotFramework {
	client: Client;
	developers: string[];
	prefix: string;
	commands = commands;

	constructor(client: Client, developers: string[], prefix: string) {
		this.client = client;
		this.developers = developers;
		this.prefix = prefix;

		this.client.on("connecting", async () => {
			console.info("[client] Connecting...");
		});
		this.client.on("connected", async () => {
			console.info("[client] Connected!");
		});
		this.client.on("ready", async () => {
			const id = client.user!._id;
			console.info(
				`[client] Logged in as ${client.user!.username} (${id})!`
			);

			// change the bot's status every 10 minutes
			setInterval(async () => {
				const index =
					Math.floor(Math.random() * statuses.length + 1) - 1;
				// @ts-ignore - the route type definitions don't like `/users/@me`
				await client.req("PATCH", `/users/@me`, {
					status: statuses[index],
				});
			}, 300000);
			// @ts-ignore
			client.req("PATCH", `/users/@me`, {
				status: { presence: "Online", text: "%help" },
			});
		});

		this.client.on("dropped", async () => {
			console.log("[client] Dropped!");
		});

		this.client.on("message", async (msg) => {
			if (!msg.author || msg.author.bot) return;

			const context = this.isValidContext(msg);
			if (!context.command || !context.canExecute) return;

			console.info(
				`[command used] ${msg.author?.username} (${msg.author_id}) in channel #${msg.channel?.name} (${msg.channel_id}) of server ${msg.channel?.server?.name} (${msg.channel?.server_id}) - ` +
					`${msg.content}`
			);

			try {
				context.command.run(msg, context.args);
			} catch (exc) {
				await msg.channel?.sendMessage(
					`Something went wrong! Please report the following to Remix's devs:\n\`\`\`js\n${exc}\`\`\``
				);
			}
		});
	}

	commandChecks(msg: Message, command: Command) {
		if (
			!msg.author?._id ||
			(command.developer && !this.developers.includes(msg.author._id))
		) {
			msg.channel?.sendMessage(
				"This command can only be used by the bot's developers."
			);
			return true;
		} else if (command.serverOnly && !msg.channel?.server) {
			msg.channel?.sendMessage(
				"This command can only be used in servers."
			);
			return true;
		} else return false;
	}

	isValidContext(msg: Message): Context {
		let values: Context = { command: null, args: [], canExecute: false };

		const prefixMention = new RegExp(`^<@!?${this.client.user!._id}>( |)$`);

		const botPinged = prefixMention.test(msg.content as string);
		if (botPinged)
			msg.channel?.sendMessage(`Hey! My prefix is \`${this.prefix}\`.`);

		// ignore system messages
		if (typeof msg.content !== "string") return values;

		if (!msg.content.startsWith(this.prefix)) return values;

		const args = msg.content.slice(this.prefix.length).split(" ");
		const commandName = args.shift();
		const command: Command = this.getCommand(commandName as string);
		values.command = command;
		values.args = args;

		if (!command) return values;

		const issues = this.commandChecks(msg, command);

		if (!issues) values.canExecute = true;
		return values;
	}

	getCommand(value: string) {
		return this.commands.find(
			(cmd) => cmd.name === value || cmd.aliases.includes(value)
		);
	}
}
