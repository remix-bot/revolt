import { Message } from "revolt.js/dist/maps/Messages";

import { strings } from "../i18n/en_GB"; // `const { strings } = await import(langName);` for proper i18n support?

import fs from "fs";

// import Axios, { AxiosRequestConfig } from "axios";

export const name = "archive";
export const aliases = [];
export const description = strings.archive.description;
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const autumnURL = msg.client.configuration?.features.autumn.url;
	// async function uploadFile(
	// 	tag: string,
	// 	file: File,
	// 	config?: AxiosRequestConfig
	// ) {
	// 	const formData = new FormData();
	// 	formData.append("file", file);

	// 	const res = await Axios.post(`${autumnURL}/${tag}`, formData, {
	// 		headers: {
	// 			"Content-Type": "multipart/form-data",
	// 		},
	// 		...config,
	// 	});

	// 	return res.data.id;
	// }

	const botMsg = await msg.channel?.sendMessage(strings.archive.fetchingInfo);
	const archiveData = {
		server_id: "",
		server_name: "",
		channel_id: "",
		channel_name: "",
		archiver: "",
		archived_at: 0,
		messages: [{}],
	};

	// gather info
	const isServer = msg.channel?.server;
	archiveData.server_id = isServer ? msg.channel.server._id : "notAServer";
	archiveData.server_name = isServer ? msg.channel.server.name : "notAServer";
	archiveData.channel_id = msg.channel_id!;
	archiveData.channel_name = msg.channel?.name!;
	archiveData.archiver = msg.author_id;
	archiveData.archived_at = msg.createdAt;

	// fetch/push messages
	await botMsg?.edit({ content: strings.archive.fetchingMessages });
	let continueFetching = true;
	let fetchbefore = msg._id;
	while (continueFetching) {
		const msgs = await msg.channel?.fetchMessagesWithUsers({
			limit: 100,
			before: fetchbefore,
		});
		if (!msgs || !msgs.messages)
			return msg.channel?.sendMessage("No messages to archive!");
		const users = msgs.members;
		msgs.messages.forEach((m) => {
			let sender;
			for (const u of users!) {
				if (m.author_id !== u.user?._id) continue;
				sender = u;
			}

			let attachmentsObj: string[] = [];
			m.attachments?.forEach((a) => {
				attachmentsObj.push(
					`${autumnURL}/attachments/${a._id}/${a.filename}`
				);
			});
			archiveData.messages.push({
				message_id: m._id,
				sender_id: m.author_id,
				sender_name:
					m.masquerade?.name ??
					sender?.nickname ??
					m.author?.username, // order: masq > nick > username
				sender_avatar: `${autumnURL}/avatars/${
					m.masquerade?.avatar ?? sender?.avatar
						? `${sender?.avatar?._id}/${sender?.avatar?.filename}`
						: `${m.author?.avatar?._id}/${m.author?.avatar?.filename}`
				}`, // order: masq > server > global
				content: m.content,
				attachments: attachmentsObj,
			});
			if (msgs.messages.length < 100) {
				continueFetching = false;
			} else {
				fetchbefore = msgs.messages[99]._id;
			}
		});
	}

	// create file
	await botMsg?.edit({ content: strings.archive.creatingFile });
	const rawjson = JSON.stringify(archiveData, null, 4);

	// remove empty pair of curly brackets ({}); also, just in case...
	// prettier-ignore
	const regex = new RegExp("        {},\n");
	const json = rawjson.replace(regex, "");

	fs.writeFile(
		`archives/archive_${msg.channel_id}_${msg.createdAt}.json`,
		json,
		(err) => {
			botMsg?.edit({
				content: strings.archive.archiveComplete(msg.channel_id),
			});
			if (err) console.log(err);
		}
	);
}
