import { Message } from "revolt.js/dist/maps/Messages";

export const name = "slap";
export const aliases = ["sendslap"];
export const description = "Who's being naughty? Give them a tight slap";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
 var slap = [
        "https://cdn.nekos.life/slap/slap_001.gif",
        "https://cdn.nekos.life/slap/slap_002.gif",
        "https://cdn.nekos.life/slap/slap_003.gif",
        "https://cdn.nekos.life/slap/slap_004.gif",
        "https://cdn.nekos.life/slap/slap_005.gif",
        "https://cdn.nekos.life/slap/slap_006.gif",
        "https://cdn.nekos.life/slap/slap_007.gif",
        "https://cdn.nekos.life/slap/slap_008.gif",
        "https://cdn.nekos.life/slap/slap_009.gif",
        "https://cdn.nekos.life/slap/slap_010.gif",
        "https://cdn.nekos.life/slap/slap_011.gif",
        "https://cdn.nekos.life/slap/slap_012.gif",
        "https://cdn.nekos.life/slap/slap_013.gif",
        "https://cdn.nekos.life/slap/slap_014.gif",
        "https://cdn.nekos.life/slap/slap_015.gif",
        "https://cdn.nekos.life/slap/slap_016.gif",
        "https://cdn.nekos.life/slap/slap_017.gif",
        "https://cdn.nekos.life/slap/slap_018.gif",
        "https://cdn.nekos.life/slap/slap_019.gif",
        "https://cdn.nekos.life/slap/slap_020.gif",
    ];
      let result = Math.floor((Math.random() * slap.length));
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[🖐](${slap[result]}) | Slaping ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;