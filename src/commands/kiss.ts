import { Message } from "revolt.js/dist/maps/Messages";

export const name = "kiss";
export const aliases = ["sendkiss"];
export const description = "Get naughty and just kiss the person!";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;

export async function run(msg, args, client) {
 var kiss = [
        "https://cdn.nekos.life/kiss/kiss_001.gif",
        "https://cdn.nekos.life/kiss/kiss_002.gif",
        "https://cdn.nekos.life/kiss/kiss_003.gif",
        "https://cdn.nekos.life/kiss/kiss_004.gif",
        "https://cdn.nekos.life/kiss/kiss_005.gif",
        "https://cdn.nekos.life/kiss/kiss_006.gif",
        "https://cdn.nekos.life/kiss/kiss_007.gif",
        "https://cdn.nekos.life/kiss/kiss_008.gif",
        "https://cdn.nekos.life/kiss/kiss_009.gif",
        "https://cdn.nekos.life/kiss/kiss_010.gif",
        "https://cdn.nekos.life/kiss/kiss_011.gif",
        "https://cdn.nekos.life/kiss/kiss_012.gif",
        "https://cdn.nekos.life/kiss/kiss_013.gif",
        "https://cdn.nekos.life/kiss/kiss_014.gif",
        "https://cdn.nekos.life/kiss/kiss_015.gif",
        "https://cdn.nekos.life/kiss/kiss_016.gif",
        "https://cdn.nekos.life/kiss/kiss_017.gif",
        "https://cdn.nekos.life/kiss/kiss_018.gif",
        "https://cdn.nekos.life/kiss/kiss_019.gif",
        "https://cdn.nekos.life/kiss/kiss_020.gif",
    ];
      let result = Math.floor((Math.random() * kiss.length));
const mentionedUser = msg.mention_ids ? msg.client.users.get(msg.mention_ids[0]) : null;
  msg.channel?.sendMessage(`[💋](${kiss[result]}) | Kissing ${mentionedUser ? `${mentionedUser.username}` : "yourself :trol:"}`).catch(e => {
  console.error('' + e);
  msg.reply('Something went wrong: 🔒 Missing permission');
    });
}
;