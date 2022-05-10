import { Message } from "revolt.js/dist/maps/Messages";

import { strings } from "../i18n/en_GB"; // `const { strings } = await import(langName);` for proper i18n support?

export const name = "ping";
export const aliases = ["pong"];
export const description = strings.ping.description;
export const developer = false;
export const serverOnly = false;

export async function run(msg: Message, args: string[]) {
  let now = Date.now();
  let memoryUsage = Math.round((process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100)
  const botMsg = await 
  msg.channel?.sendMessage(strings.ping.pong);
	botMsg?.edit({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: strings.ping.pong,
                description: `
-This took \`${Date.now() - msg.createdAt}\` ms.\n-MemoryUsage \`${memoryUsage}\`\n-Api latency \`${botMsg.client.websocket.ping ?? '--' - msg.client.websocket.ping ?? '--'}\` ms.\n-Msg \`${Math.round(Date.now() - `${now}`) / 2}\` ms.
`,
                colour: strings.embeds.accent,
                icon_url: msg.author.display_avatar,
            },
        ],
    }).catch(err => {
            // msg.channel?.sendMessage("# Permission error\nMake sure the bot has a role with the Manage Channels permission." + err);
                });
}
;