import { Message } from "revolt.js/dist/maps/Messages";
import fetch from "node-fetch";
import { stringify } from "querystring";
import { strings } from "../i18n/en_GB";

export const name = "npm";
export const aliases = ["npmsearch"];
export const description = "Search packages on NPM.";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const input = args.join(" ");
	if (!input) {
		return msg.channel?.sendMessage({
			content: " ",
			embeds: [
				{
					type: "Text",
					title: "No package specified",
					description: "You need to specify a package.",
					colour: "#e9196c",
				},
			],
		});
	} else {
		let url = `https://api.npms.io/v2/search?q=${encodeURIComponent(
			args.join(" ")
		)}`;
		const rawData = await fetch(url);
		const data = (await rawData.json()) as any;
		if (data) {
			if (data.total === 0)
				return msg.channel?.sendMessage({
					content: " ",
					embeds: [
						{
							type: "Text",
							title: "No results",
							description:
								"There were no results for your query - did you type the package's name correctly?",
							colour: "#e9196c",
						},
					],
				});

			const pkg = data.results[0].package;
			msg.channel?.sendMessage({
				content: " ",
				embeds: [
					{
						type: "Text",
						title: strings.npm.npmTitle(pkg.name),
						description: `${
							pkg.description ?? strings.npm.noDesc
						}\n${
							pkg.keywords
								? `\n**Keywords**\n\`${pkg.keywords.join(
										"`, `"
								  )}\`\n`
								: ""
						}\n${strings.npm.latestVer}\nv${
							pkg.version
						}\n\n**Links**\n[View on NPM](${pkg.links.npm}) ${
							pkg.links.homepage
								? ` • [Homepage](${pkg.links.homepage})`
								: ""
						} ${
							pkg.links.repository
								? ` • [Repository](${pkg.links.repository})`
								: ""
						}`,
						url: pkg.links.npm,
						colour: strings.embeds.accent,
					},
				],
			});
		} else {
			msg.channel?.sendMessage("Something went wrong :flushed:");
		}
	}
}
