import { Message } from "revolt.js/dist/maps/Messages";

import { strings } from "../i18n/en_GB";

export const name = "shutdown";
export const aliases = ["sd"];
export const description = "Shuts down the bot.";
export const developer = true;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	await msg.channel?.sendMessage(strings.shutdown.response);
	process.exit();
}
