import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "invite";
export const aliases = ["inv"];
export const description = "Invite the bot to you're server.";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
const avatarUrl = `https://i.imgur.com/WhFi1qf.png`;
	msg.channel?.sendMessage({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Invite:",
        icon_url: `${avatarUrl}`,
				description: `https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW`,
				colour: strings.embeds.accent,
            },
		],
	}).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;