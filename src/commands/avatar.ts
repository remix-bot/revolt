import { Message } from "revolt.js/dist/maps/Messages";

export const name = "avatar";
export const aliases = ["av"];
export const description = "Returns the first mentioned user's avatar (or if no users are mentioned, the author's).";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
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
				title: "Avatar:",
				description: `**${
					mentionedUser ? `${mentionedUser.username}'s` : "Your"
				} avatar**`,
				colour: "#e9196c",
				// media: avatarUrl,
			},
		],
	});
}
