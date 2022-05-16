import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "support";
export const aliases = ["sp"];
export const description = "Support Server.";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {

  msg.channel?.sendMessage({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "Support:",
				description: `https://app.revolt.chat/invite/qvJEsmPt`,
				colour: strings.embeds.accent,
			},
		],
	}).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;