import random

import aiohttp
import asyncpraw
import voltage
from voltage.ext.commands import SubclassedCog


def setup(client: voltage.Client) -> SubclassedCog:
    nsfw = SubclassedCog(name="NSFW (Images)", description="Gets images")

    # I would recommend to please use your own keys (also edit nsfw.py(here) for this part too)
    # Get your keys @ https://www.reddit.com/prefs/apps
    reddit = asyncpraw.Reddit(
        client_id="",
        client_secret="",
        user_agent="remix",
    )

    @nsfw.command()
    async def hentai(ctx):
        if ctx.channel.nsfw:
            msg = await ctx.reply("Requesting 🔞...")
            hsubs = ["hentai", "HENTAI_GIF"]

            hentai_reddit = await reddit.subreddit(f"{random.choice(hsubs)}", fetch=True)

            hentai_subs = []

            async for submission in hentai_reddit.hot(limit=250):
                hentai_subs.append(submission)

            random_hsub = random.choice(hentai_subs)

            h_name = random_hsub.title
            h_url = random_hsub.url

            embed = voltage.SendableEmbed(
                title=f"Requested by {ctx.author.name}",
                description=f"[{h_name}]({h_url})",
                icon_url=ctx.author.avatar.url,
                media=h_url,
                color="#e9196c",
            )

            return await msg.edit(embed=embed)
        else:
            await ctx.send("This channel is not an NSFW marked channel!, You trynna get me in trouble?")

    @nsfw.command(aliases=["r34"])
    async def rule34(ctx):
        if ctx.channel.nsfw:
            msg = await ctx.reply("Requesting 🔞...")
            r34subs = [
                "Rule_34",
                "WesternHentai",
                "rule34",
                "rule34cartoons",
                "hentaiwaifus69",
            ]

            r34_reddit = await reddit.subreddit(f"{random.choice(r34subs)}", fetch=True)

            r34_submissions = []

            async for submission in r34_reddit.hot(limit=250):
                r34_submissions.append(submission)

            random_r34sub = random.choice(r34_submissions)

            r34_name = random_r34sub.title
            r34_url = random_r34sub.url

            embed = voltage.SendableEmbed(
                title=f"Requested by {ctx.author.name}",
                description=f"[{r34_name}]({r34_url})",
                icon_url=ctx.author.avatar.url,
                media=r34_url,
                color="#e9196c",
            )
            return await msg.edit(content="[]()", embed=embed)
        else:
            await ctx.send("This channel is not an NSFW marked channel!, You trynna get me in trouble?")

    return nsfw
