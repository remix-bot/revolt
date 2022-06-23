import aiohttp
import voltage
import random
from voltage.ext.commands import SubclassedCog


def setup(client: voltage.Client) -> SubclassedCog:
    nsfw = SubclassedCog(name="NSFW (Images)", description="Gets images")

    @nsfw.command()
    async def hentai(ctx):
        if ctx.channel.nsfw:
            async with aiohttp.ClientSession() as session:
                hsubs = ["hentai", "HENTAI_GIF"]
                hrqs = await session.get(
                    f"https://cryptons-api.herokuapp.com/api/v1/reddit?subreddit={random.choice(hsubs)}"
                )
                himg = await hrqs.json()
                embed = voltage.SendableEmbed(
                    title=f"Requested by {ctx.author.name}",
                    description=f"[{himg['title']}]({himg['url']})",
                    icon_url=ctx.author.avatar.url,
                    media=himg["image"],
                    color="#e9196c",
                )
                return await ctx.send(content="[]()", embed=embed)
        else:
            await ctx.send(
                "This channel is not an NSFW marked channel!, You trynna get me in trouble?"
            )

    @nsfw.command()
    async def rule34(ctx):
        if ctx.channel.nsfw:
            async with aiohttp.ClientSession() as session:
                r34subs = [
                    "Rule_34",
                    "WesternHentai",
                    "rule34",
                    "rule34cartoons",
                    "hentaiwaifus69",
                ]
                request34 = await session.get(
                    f"https://cryptons-api.herokuapp.com/api/v1/reddit?subreddit={random.choice(r34subs)}"
                )
                r34img = await request34.json()
                embed = voltage.SendableEmbed(
                    title=f"Requested by {ctx.author.name}",
                    description=f"[{r34img['title']}]({r34img['url']})",
                    icon_url=ctx.author.avatar.url,
                    media=r34img["image"],
                    color="#e9196c",
                )
                return await ctx.send(content="[]()", embed=embed)
        else:
            await ctx.send(
                "This channel is not an NSFW marked channel!, You trynna get me in trouble?"
            )

    return nsfw
