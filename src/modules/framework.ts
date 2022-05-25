import { Client } from "revolt.js";
import { commands } from "./commands.js";
import { statuses } from "../config/statuses.js";
import { strings } from "../i18n/en_GB.js";
import { isValidContext } from "./functions.js";

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
			//setInterval(async () => {
			//	const index =
			//		Math.floor(Math.random() * statuses.length + 1) - 1;
				// @ts-expect-error - the route type definitions don't like `/users/@me`
			//	await client.req("PATCH", `/users/@me`, {
			//		status: statuses[index],
			//	});
		//	}, 300000);
		});

		this.client.on("dropped", async () => {
			console.log("[client] Dropped!");
		});

		this.client.on("message", async (msg) => {
			try {
				if (!msg.author || msg.author.bot) return;

				const context = isValidContext(msg, this);
				if (!context.command || !context.canExecute) return;

				console.info(
					`[command used] ${msg.author?.username} (${msg.author_id}) in channel #${msg.channel?.name} (${msg.channel_id}) of server ${msg.channel?.server?.name} (${msg.channel?.server_id}) - ` +
						`${msg.content}`
				);
				context.command.run(msg, context.args);
			} catch (exc) {
				try {
					await msg.channel?.sendMessage(
						strings.errors.genericErrorWithTrace(exc)
					);
				} catch {
					console.log(exc);
				}
			}
		});
	}
}
