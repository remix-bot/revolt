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

			await client.api.patch("/users/@me", {status: {text: `%help | remixbot.cf`, presence: "Online"}, profile: {content: `Remix is a first open source music bot under development for Revolt! if you need help or have any suggestions or feedback, join our support server.

[Website](<https://remixbot.cf>) • [Add the bot here](<https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW>) • [Support Server](<https://app.revolt.chat/invite/qvJEsmPt>) • [Patreon](<https://www.patreon.com/remixbot>)

You can find Remix's source code [here](<https://github.com/remix-bot/revolt>) - This bot is based on [RexBot](<https://github.com/rexogamer/rexbot>)

#remix #remixbot #bot #bots #music #musicbot #firstmusicbot #revolt #revoltbot #revoltmusicbot #first`}});
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
