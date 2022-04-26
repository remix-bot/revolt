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
\`avatar\`, \`help\`, \`info\`, \`uptime\`, \`support\`, \`invite\`, \`ping\`, \`website\`, \`archive\`, \`wikipedia\`, \`github\`, \`npm\`, \`eval\`

** **
### Fun Commands
\`cat\`, \`dog\`, \`ship\`, \`meme\`, \`coinflip\`, \`rps\`, \`howgay\`, \`8ball\`, \`duck\`, \`art\`, \`say\`

** **
### Music Commands (Soon)
\`play\`, \`skip\`, \`disconnect\`, \`nowplaying\`, \`pause\`

** **
[Invite](<https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW>) | [Support](<https://app.revolt.chat/invite/qvJEsmPt>) | [Donate](<https://patreon.com/remixbot>) | [Articles](<https://remixbot.cf/articles>) | [Source Code](<https://github.com/remix-bot/Remix>)
`),
                colour: "#e9196c"
            },
        ]
    });
}
;
