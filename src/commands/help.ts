import { Message } from "revolt.js/dist/maps/Messages";
import { Command } from "../types/command.js";
import { config } from "../config.js";
import { getCommand } from "../modules/functions.js";

export const name = "help";
export const aliases = ["h"];
export const description =
	"Returns a list of the bot's commands or, if a command is specified, info about the command.";
export const usage = "help [command]";
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
	const botMsg = await msg.channel?.sendMessage("Help");
    botMsg?.edit({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `Remix Bot Help`,
                description: (`
\`View commands online:\` https://remixbot.cf/commands

** **
### Misc Commands
\`archive\`, \`avatar\`, \`create\`, \`eval\`, \`github\`, \`help\`, \`invite\`, \`npm\`, \`ping\`, \`stats\`. \`support\`, \`uptime\`, \`website\`, \`wikipedia\`

** **
### Fun Commands
\`art\`, \`cat\`, \`coinflip\`, \`dog\`, \`duck\`, \`howgay\`, \`meme\`, \`rps\`, \`say\`, \`ship\`, \`8ball\`

** **
### Music Commands (Soon)
\`disconnect\`, \`pause\`, \`play\`, \`nowplaying\`, \`skip\`

** **
[Invite](<https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW>) | [Support](<https://app.revolt.chat/invite/qvJEsmPt>) | [Donate](<https://patreon.com/remixbot>) | [Articles](<https://remixbot.cf/articles>) | [Source Code](<https://github.com/remix-bot/Remix>)
`),
                colour: "#e9196c"
            },
        ]
    });
}
;
