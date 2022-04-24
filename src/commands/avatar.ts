import { Message } from "revolt.js/dist/maps/Messages";

export const name = "avatar";
export const aliases = ["av"];
export const description =
	"Returns the first mentioned user's avatar (or if no users are mentioned, the author's).";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message) {
	const mentionedUser = msg.mention_ids
		? msg.client.users.get(msg.mention_ids[0])
		: null;
	return msg.channel?.sendMessage(
		`# ${
			mentionedUser ? `${mentionedUser.username}'s` : "Your"
		} avatar:\n\n[**Link**](https://autumn.revolt.chat/avatars/${
			mentionedUser ? mentionedUser.avatar?._id : msg.author?.avatar?._id
		}/${
			mentionedUser
				? mentionedUser.avatar?.filename
				: msg.author?.avatar?.filename
		})`
	);
}
