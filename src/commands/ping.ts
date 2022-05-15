import { strings } from "../i18n/en_GB"; // `const { strings } = await import(langName);` for proper i18n support?
export const name = "ping";
export const aliases = ["pong"];
export const description = strings.ping.description;
export const developer = false;
export const serverOnly = false;
export async function run(msg, args) {

  const avatarUrl = `https://autumn.revolt.chat/avatars/${msg.author?.avatar?._id}/${msg.author?.avatar?.filename}`;
  
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
                icon_url: `${avatarUrl}`,
                description: `
-Api latency \`${botMsg.client.websocket.ping ?? '--' - msg.client.websocket.ping ?? '--'}\` ms.\n-MemoryUsage \`${memoryUsage}\`\n-Msg \`${Math.round(Date.now() - `${now}`) / 2}\` ms.
`,
                colour: strings.embeds.accent,
            },
        ],
    }).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;