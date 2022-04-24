export const strings = {
	archive: {
		description: "Archives the current channel's messages.",
		fetchingInfo: "Fetching info...",
		fetchingMessages: "Fetching messages...",
		creatingFile: "Creating archive file...",
		archiveComplete: (channelid: string) => {
			return `Finished archiving <#${channelid}>! For now, contaxt Rexo for the file.`;
		},
	},
	avatar: {
		description:
			"Returns the first mentioned user's avatar (or if no users are mentioned, the author's).",
	},
	help: {
		pingPrefix: (prefix: string) => {
			return `Hey! My prefix is \`${prefix}\`.`;
		},
		noDesc: "No description.",
	},
	npm: {
		npmTitle: (name: string) => {
			return `${name} on NPM`;
		},
		noDesc: "*This library has no description.*",
		latestVer: "**Latest version**",
	},
	ping: {
		description: "Pong.",
		pong: "Pong!",
	},
	shutdown: {
		response: "Shutting down...",
	},
	wikipedia: {
		noExtract:
			"*No extract available - feel free to take a look at the page using the links below*",
		cannotFindArticle: (input: string) => {
			return `${input} doesn't seem to be an article - did you spell the title correctly?`;
		},
		userAgent:
			"RexBot/1.0 (https://github.com/rexogamer/rexbot, User:Remagoxer)",
	},
	errors: {
		genericError: "Something went wrong :flushed:",
		genericErrorWithTrace: (trace: any) => {
			return `Something went wrong! Please report the following to RexBot's devs:\n\`\`\`js\n${trace}\`\`\``;
		},
		couldNotFetchData: "There was an issue fetching the data.",
		serverOnlyCommand: "This command can only be used in servers.",
		devOnlyCommand:
			"This command can only be used by the bot's developers.",
	},
	embeds: {
		accent: "#e9196c)",
		error: "#e9196c",
	},
};
