import { Message } from "revolt.js/dist/maps/Messages";

export const name = "hug";
export const aliases = ["sendhug"];
export const description = "Someone needs a hug? Why wait, just give it!";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
 var hug = [
        "https://cdn.nekos.life/hug/hug_001.gif",
        "https://cdn.nekos.life/hug/hug_002.gif",
        "https://cdn.nekos.life/hug/hug_003.gif",
        "https://cdn.nekos.life/hug/hug_004.gif",
        "https://cdn.nekos.life/hug/hug_005.gif",
        "https://cdn.nekos.life/hug/hug_006.gif",
        "https://cdn.nekos.life/hug/hug_007.gif",
        "https://cdn.nekos.life/hug/hug_008.gif",
        "https://cdn.nekos.life/hug/hug_009.gif",
        "https://cdn.nekos.life/hug/hug_010.gif",
        "https://cdn.nekos.life/hug/hug_011.gif",
        "https://cdn.nekos.life/hug/hug_012.gif",
        "https://cdn.nekos.life/hug/hug_013.gif",
        "https://cdn.nekos.life/hug/hug_014.gif",
        "https://cdn.nekos.life/hug/hug_015.gif",
        "https://cdn.nekos.life/hug/hug_016.gif",
        "https://cdn.nekos.life/hug/hug_017.gif",
        "https://cdn.nekos.life/hug/hug_018.gif",
        "https://cdn.nekos.life/hug/hug_019.gif",
        "https://cdn.nekos.life/hug/hug_020.gif",
    ];
      let result = Math.floor((Math.random() * hug.length));
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[🤗](${hug[result]}) | Hugging ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;