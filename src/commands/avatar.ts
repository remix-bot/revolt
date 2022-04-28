import { Message } from "revolt.js/dist/maps/Messages";

import { strings } from "../i18n/en_GB";

export const name = "avatar";
export const aliases = ["av"];
export const description = strings.avatar.description;
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message) {
	const mentionedUser = msg.mention_ids
		? msg.client.users.get(msg.mention_ids[0])
		: null;
	const avatarUrl = `https://autumn.revolt.chat/avatars/${
		mentionedUser ? mentionedUser.avatar?._id : msg.author?.avatar?._id
	}/${
		mentionedUser
			? mentionedUser.avatar?.filename
			: msg.author?.avatar?.filename
	}`;
	return msg.channel?.sendMessage({
		content: `[**Link**](<${avatarUrl}>)`,
		embeds: [
			{
				type: "Text",
				title: "Remix",
				description: `**${
					mentionedUser ? `${mentionedUser.username}'s` : "Your"
				} avatar**`,
				colour: strings.embeds.accent,
				// media: avatarUrl,
			},
		],
	});
}
