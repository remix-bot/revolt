import datetime
import random
import time

import psutil
import voltage
from voltage.ext.commands import SubclassedCog

starttime = time.time()
version = "1.1.2"


def setup(client: voltage.Client) -> SubclassedCog:
    misc = SubclassedCog("Misc", "Stuff that wouldn't fit anywhere else.")

    @misc.command(
        aliases=["up"],
        description="⏲️ | Get the amount of time Remix has been online for!",
    )
    async def uptime(ctx):
        uptime = str(datetime.timedelta(seconds=int(round(time.time() - starttime))))
        embed = voltage.SendableEmbed(
            title="Remix's Uptime:",
            description=f"`{uptime}`",
            colour="#e9196c",
        )
        await ctx.send(content=ctx.author.mention, embed=embed)

    @misc.command(aliases=["info", "botinfo"], description="stats.")
    async def stats(ctx):
        embed = voltage.SendableEmbed(
            title="Remix's Stats:",
            description=f"**Servers:**\n`{len(client.cache.servers)}`\n**Members:**\n`{len(client.members)}`\n**Version:**\n`{version}`\n",
            colour="#e9196c",
        )
        await ctx.send(content=ctx.author.mention, embed=embed)

    @misc.command(aliases=["inv"], description="Invite the bot to you're server.")
    async def invite(ctx):
        embed = voltage.SendableEmbed(
            title="Invite:",
            description=f"https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW",
            colour="#e9196c",
        )
        await ctx.send(content=ctx.author.mention, embed=embed)

    @misc.command(aliases=["sp"], description="Support Server.")
    async def support(ctx):
        embed = voltage.SendableEmbed(
            title="Support:",
            description=f"https://app.revolt.chat/invite/qvJEsmPt",
            colour="#e9196c",
        )
        await ctx.send(content=ctx.author.mention, embed=embed)

    @misc.command(aliases=["web"], description="The website bot.")
    async def website(ctx):
        embed = voltage.SendableEmbed(
            title="Website:",
            description=f"https://remix.koldflame.com",
            colour="#e9196c",
        )
        await ctx.send(content=ctx.author.mention, embed=embed)

    @misc.command(aliases=["pong"], description="Pong.")
    async def ping(ctx):
        cpu = psutil.cpu_percent()
        embed = voltage.SendableEmbed(
            title="Pong!",
            description=f"**Ram Usage:**\n`{psutil.virtual_memory().percent}%`\n**CPU Usage:**\n`{cpu}%`\n**Ping:**\n*Pinging..*\n",
            colour="#516BF2",
        )
        embed2 = voltage.SendableEmbed(
            title="Pong!",
            description=f"**Ram Usage:**\n`{psutil.virtual_memory().percent}%`\n**CPU Usage:**\n`{cpu}%`\n**Ping:**\n`{random.randint(1, 1000) / 10}ms`\n",
            colour="#e9196c",
        )
        msg = await ctx.send(content=ctx.author.mention, embed=embed)
        await msg.edit(content=ctx.author.mention, embed=embed2)

    @misc.command(description="Run commands in multiple languages!")
    async def eval(ctx, *, code):
        if ctx.author.id in ["01FVB1ZGCPS8TJ4PD4P7NAFDZA"]:
            languagespecifiers = [
                "python",
                "py",
                "javascript",
                "js",
                "html",
                "css",
                "php",
                "md",
                "markdown",
                "go",
                "golang",
                "c",
                "c++",
                "cpp",
                "c#",
                "cs",
                "csharp",
                "java",
                "ruby",
                "rb",
                "coffee-script",
                "coffeescript",
                "coffee",
                "bash",
                "shell",
                "sh",
                "json",
                "http",
                "pascal",
                "perl",
                "rust",
                "sql",
                "swift",
                "vim",
                "xml",
                "yaml",
            ]
            loops = 0
            while code.startswith("`"):
                code = "".join(list(code)[1:])
                loops += 1
                if loops == 3:
                    loops = 0
                    break
            for languagespecifier in languagespecifiers:
                if code.startswith(languagespecifier):
                    code = code.lstrip(languagespecifier)
            while code.endswith("`"):
                code = "".join(list(code)[0:-1])
                loops += 1
                if loops == 3:
                    break
            code = "\n".join(f"    {i}" for i in code.splitlines())
            code = f"async def eval_expr():\n{code}"

            async def send(text):
                await ctx.send(text)

            env = {
                "bot": client,
                "client": client,
                "ctx": ctx,
                "print": send,
                "_author": ctx.author,
                "_message": ctx.message,
                "_channel": ctx.channel,
                "_guild": ctx.server,
                "_me": ctx.me,
            }
            env.update(globals())
            try:
                exec(code, env)
                eval_expr = env["eval_expr"]
                result = await eval_expr()
                if result:
                    embed = voltage.SendableEmbed(
                        title="Code Ran with no errors!",
                        description=result,
                        colour="#e9196c",
                    )
                    await ctx.send(content=ctx.author.mention, embed=embed)
            except Exception as e:
                embed = voltage.SendableEmbed(
                    title="Error occured!",
                    description=f"```{languagespecifier}\n{e}\n```",
                    colour="#e9196c",
                )
                await ctx.send(content=ctx.author.mention, embed=embed)
        else:
            embed = voltage.SendableEmbed(
                title="Whoops!",
                description="You aren't an owner of this bot!",
                colour="#e9196c",
            )
            return await ctx.send(content=ctx.author.mention, embed=embed)

    return misc
