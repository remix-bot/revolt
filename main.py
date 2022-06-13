import asyncio
import json
import os
import random

import voltage
from voltage.ext import commands


async def get_prefix(message, client):
    if message.server is None:
        return ["%", f"{client.user.mention} ", client.user.mention]
    with open("prefixes.json", "r") as f:
        prefixes = json.load(f)

    return [
        prefixes.get(str(message.server.id), "%"),
        f"{client.user.mention} ",
        client.user.mention,
    ]


class MyHelpCommand(commands.HelpCommand):
    async def send_help(self, ctx: commands.CommandContext):
        embed = voltage.SendableEmbed(
            title="Help",
            description=f"Use `{ctx.prefix}help <command>` to get help for a command.",
            colour="#e9196c",
            icon_url=ctx.author.display_avatar.url,
        )
        text = "\n### **No Category**\n"
        for command in self.client.commands.values():
            if command.cog is None:
                text += ", ".join([f"`{command.name}` "])
        for i in self.client.cogs.values():
            text += f"\n### **{i.name}**\n{i.description}\n"
            text += ", ".join([f"`{j.name}`" for j in i.commands])

        if embed.description:
            embed.description += text
        return await ctx.reply(f"[]({ctx.author.id})", embed=embed)


client = commands.CommandsClient(get_prefix, help_command=MyHelpCommand)


@client.listen("ready")  # You can still listen to events.
async def ready():
    for i in range(1, 10000):
        statuses = [
            f"%help | {len(client.cache.servers)} servers and {len(client.members)} users!",
            f"%help | https/remixbot.cf",
        ]
        status = random.choice(statuses)
        await client.set_status(status, voltage.PresenceType.online)
        await asyncio.sleep(5)


@client.error("message")
async def on_message_error(error: Exception, message: voltage.Message):
    await message.reply(f"An error has occured: {error}")


@client.command(aliases=["px"], description="Custom prefixes for your own servers.")
async def prefix(ctx: commands.CommandContext, prefix):
    if ctx.server is None:
        return await ctx.reply("Custom prefixes are only available in servers.")
    if not ctx.author.permissions.kick_members:
        return await ctx.reply("You don't have permission to change the prefix")
    with open("prefixes.json", "r") as f:
        prefixes = json.load(f)
    prefixes[str(ctx.server.id)] = prefix
    with open("prefixes.json", "w") as f:
        json.dump(prefixes, f)
    await ctx.reply(f"Prefix changed to `{prefix}`")


@client.command(description="Load a cog.")
async def load(ctx, cog: str):
    if ctx.author.id in ["01FVB1ZGCPS8TJ4PD4P7NAFDZA"]:
        return await ctx.send(
            "You are not my owner, there's honestly nothing wrong with that but I won't let you do \
                that because you don't have a phd in starting rebellions against the british empire."
        )
    client.add_extension(f"cogs.{cog}")
    await ctx.reply(f"Cog `{cog}` loaded")


@client.command(description="reload a cog.")
async def reload(ctx, cog: str):
    if ctx.author.id in ["01FVB1ZGCPS8TJ4PD4P7NAFDZA"]:
        return await ctx.send(
            "You are not my owner, there's honestly nothing wrong with that but I won't let you do \
                that because you don't have a phd in starting rebellions against the british empire."
        )
    client.reload_extension(f"cogs.{cog}")
    await ctx.reply(f"Cog `{cog}` reloaded")


@client.command(description="Unload a cog.")
async def unload(ctx, cog: str):
    if ctx.author.id in ["01FVB1ZGCPS8TJ4PD4P7NAFDZA"]:
        return await ctx.send(
            "You are not my owner, there's honestly nothing wrong with that but I won't let you do \
                that because you don't have a phd in starting rebellions against the british empire."
        )
    client.remove_extension(f"cogs.{cog}")
    await ctx.reply(f"Cog `{cog}` unloaded")


client.add_extension("cogs.fun")
client.add_extension("cogs.image")
client.add_extension("cogs.misc")
client.add_extension("cogs.music")

client.run(os.environ["TOKEN"])
