import { Message } from "revolt.js/dist/maps/Messages";
import { Command } from "../types/command.js";


export const name = "help";
export const aliases = ["h"];
export const description = "Returns a list of the bot's commands.";
export const category = "Misc";
export const usage = "help [command]";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {
    const botMsg = await msg.channel?.sendMessage("Help");
    botMsg?.edit({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `Remix Bot Help`,
                description: (`
:game_die: **Misc**
avatar, help, info, uptime, support, invite, ping, website              
** **
:information_desk_person: **Fun**
cat, dog, ship, meme, coinflip, rps, howgay, 8ball, duck, art, say

** **
:musical_note: **Music (Soon)**
play, skip, disconnect, nowplaying, pause
`),
                colour: "#e9196c"
            },
        ]
    });
}
;
