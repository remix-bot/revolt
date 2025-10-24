const { CommandBuilder } = require("../Commands.js");
const axios2 = require("axios");
const {
	RemoteParticipant,
	RemoteTrack,
	RemoteTrackPublication,
	Room,
	RoomEvent,
	dispose,
	AudioFrame,
	AudioSource,
	LocalAudioTrack,
	TrackPublishOptions,
	TrackSource,
	AudioTrack,
	RoomContext,
	useMaybeRoomContext,
	useTracks
} = require('@livekit/rtc-node');
livekitt = require('@livekit/rtc-node');
const { join } = require('node:path');

const { readFileSync } = require("fs");

async function joinChannel3(ttt, message, cid) {


	//console.log(ttt);
	let DATA = null;
	console.log(cid);
	try {
		DATA = await ttt.client.api.post("/channels/" + cid + "/join_call",
			{ node: "worldwide" },
			{
				headers: {
					"User-Agent": "Mozilla/5.0 (X11; Linux  x86_64; rv:138.0) Gecko/20100101 Firefox/138.0",
					"Accept": "/", "Accept-Language": "en-US,en;q=0.5",
					"Content-Type": "application/json", "Sec-GPC": "1",
					"Alt-Used": "stoat.chat", "Sec-Fetch-Dest": "empty",
					"Sec-Fetch-Mode": "cors",
					"Sec-Fetch-Site": "same-origin",
					"Priority": "u=0"
				}
			})
	} catch (error) {

		message.channel.sendMessage("There was a error with fetching");
		return -1;

	}

	if (!DATA) {
		console.log("NO DATA")
		return;
	}

	if (DATA.type == 'NotAVoiceChannel') {
		message.channel.sendMessage("Not a voice channel lol, are you even using the new client???");
		return -1;
	};

	if (DATA.type == 'InternalError') {
		message.channel.sendMessage("Prob a revolt issue but\n Internal Error, on POST /channels/" + cid + "/join_call");
		return -1;

	}
	message.channel.sendMessage("Fetch_successfull.");
	let room_data = DATA;
	console.log(DATA);
	const room = new Room({

	});

	console.log("connecting");

	await room.connect(room_data.url, room_data.token);

	console.log("connected");
	/* Use these later I guess
	room
	.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
	.on(RoomEvent.Disconnected, handleDisconnected)
	.on(RoomEvent.LocalTrackPublished, handleLocalTrackPublished);
	*/


	const sample = readFileSync(join(process.cwd(), '../revoice.js/src/test.wav'));
	const channels = sample.readUInt16LE(22);
	const sampleRate = sample.readUInt32LE(24);
	const dataSize = sample.readUInt32LE(40) / 2;


	// set up audio track
	const source = new AudioSource(sampleRate, channels);
	const track = LocalAudioTrack.createAudioTrack('audio', source);
	const options = new TrackPublishOptions();
	const buffer = new Int16Array(sample.buffer);
	options.source = TrackSource.SOURCE_MICROPHONE;
	await room.localParticipant.publishTrack(track, options).then((pub) => pub.waitForSubscription());

	let written = 44; // start of WAVE data stream
	const FRAME_DURATION = 1; // write 1s of audio at a time
	const numSamples = sampleRate * FRAME_DURATION;
	while (written < dataSize) {
		console.log("writing");
		const available = dataSize - written;
		const frameSize = Math.min(numSamples, available);

		const frame = new AudioFrame(
			buffer.slice(written, written + frameSize),
			sampleRate,
			channels,
			Math.trunc(frameSize / channels),
		);
		await source.captureFrame(frame);
		written += frameSize;
	}
	await source.waitForPlayout();
	// release resources allocated for audio publishing
	await track.close(); // this deallocate source as well


	await room.disconnect();
	message.channel.sendMessage("Debug_end");

	process.on('SIGINT', async () => {
		await room.disconnect();
		await dispose();
	});
}



module.exports = {
	command: new CommandBuilder()
		.setName("Earfk")
		.setDescription("Self explanatory, pushes loud audio on a channel.", "commands.join")
		.setId("Earfk")
		.addStringOption((option) =>
			option.setName("Channel ID")
				.setId("cid")
				.setDescription("Specify the channel, the bot should join. This is necessary due to (current) Revolt limitations.", "options.join.channel")
				.setRequired(true)
		),
	run: async function (msg, data) {
		const cid = data.getById("cid").value;

		msg.reply(await joinChannel3(this, msg, cid));
	}
}
