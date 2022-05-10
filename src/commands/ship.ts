import { Message } from "revolt.js/dist/maps/Messages";
import { strings } from "../i18n/en_GB";

export const name = "ship";
export const aliases = ["simp", "love"];
export const description = "Love percentage.";
export const category = "Fun";
export const developer = false;
export const serverOnly = false;
export async function run(msg, args, client) {
const mentionedUser = msg.mention_ids
        ? msg.client.users.get(msg.mention_ids[0])
        : null;
const love = Math.round(Math.random() * 100);
const loveIndex = Math.floor(love / 10);
const loveLevel = "💖".repeat(loveIndex) + "💔".repeat(10 - loveIndex);
  let question = args[0]
        if (!question) return msg.reply("Please mention first")
  msg.channel?.sendMessage({
        content: " ",
        embeds: [
            {
                type: "Text",
                title: `Love percentage:`,
                description: (`Loves ${mentionedUser ? `${mentionedUser.username}'s` : "Your"} this much: \`${love}%\`\n\n${loveLevel}`),
                colour: strings.embeds.accent,
            },
        ]
    }).catch(err => {
            // msg.channel?.sendMessage("# Permission error\nMake sure the bot has a role with the Manage Channels permission." + err);
                });
}
;