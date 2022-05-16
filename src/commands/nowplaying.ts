import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "nowplaying";
export const aliases = ["np"];
export const description = "Under development >:|";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {

  const avatarUrl = `https://i.imgur.com/Xqt8IKj.png`;
	msg.channel?.sendMessage({
		content: " ",
		embeds: [
			{
				type: "Text",
				title: "NowPlaying:",
        icon_url: `${avatarUrl}`,
				description: `### Notice from Remix's developers:
This command is not currently available because we do not have our own library for the bot to play music in voice channels this is not our fault, but don't worry when [Revolt.js](<https://www.npmjs.com/package/revolt.js>) gets a new update over time, we will add it as soon as possible!

Stay tuned, and thanks for choosing [Remix](<https://app.revolt.chat/invite/qvJEsmPt>)!`,
				colour: strings.embeds.accent,
            },
		],
	}).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;