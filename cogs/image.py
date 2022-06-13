import random

import aiohttp
import requests
import voltage
from voltage.ext.commands import SubclassedCog


def setup(client: voltage.Client) -> SubclassedCog:
    image = SubclassedCog(name="Images", description="Gets images")

    @image.command()
    async def meme(ctx):
        async with aiohttp.ClientSession() as session:
            subs = [
                "dankmemes",
                "memes",
                "BlackPeopleTwitter",
                "comedyhomicide",
                "HolUp",
                "KSI",
                "Pewdiepie",
            ]
            img = await session.get(f"https://cryptons-api.herokuapp.com/api/v1/reddit?subreddit={random.choice(subs)}")
            meme = await img.json()
            embed = voltage.SendableEmbed(
                title=f"Requested by {ctx.author.name}",
                description=f"[{meme['title']}]({meme['url']})",
                icon_url=ctx.author.avatar.url,
                media=meme["image"],
                colour="#e9196c",
            )
            return await ctx.reply(content="#", embed=embed)

    @image.command()
    async def cat(ctx):
        async with aiohttp.ClientSession() as session:
            img_request = await session.get("https://cataas.com/cat?json=true")
            fact_request = await session.get("https://catfact.ninja/fact")
            catimg = await img_request.json()
            fact = await fact_request.json()
            embed = voltage.SendableEmbed(
                title="Meow!",
                description=fact["fact"],
                media=f"https://cataas.com{catimg['url']}",
                colour="#e9196c",
            )
            return await ctx.reply(content="#", embed=embed)

    @image.command(
        aliases=["cattosay", "meowsay", "kittysay", "kittensay"],
        description="Gives you a random cat image with a caption of your choice. Note: Use the backslash to escape newlines, quotation marks, and other special characters.",
    )
    async def catsay(ctx, *, caption: str):
        request = requests.get(f"https://cataas.com/cat/says/{caption}?json=true")
        kitten = request.json()
        embed = voltage.SendableEmbed(
            title="Meow!",
            description="Here's your caption!",
            media=f"https://cataas.com{kitten['url']}",
            color="#e9196c",
        )
        await ctx.send(content="#", embed=embed)

    @image.command(description="Gives you a random meme image.")
    async def ben(ctx, *, message: str = None):
        if message == None:
            return await ctx.send("provide something for me to say you idiot")
        benResponses = [
            "https://media.discordapp.net/attachments/970069401200115723/978805957624754226/benyes.mp4",
            "https://media.discordapp.net/attachments/970069401200115723/978753155045130251/benno.mp4",
            "https://media.discordapp.net/attachments/970069401200115723/978806204207861831/benhoho.mp4",
            "https://media.discordapp.net/attachments/970069401200115723/978805736220000296/benuhh.mp4",
        ]
        embed = voltage.SendableEmbed(
            title=f"{ctx.author.name}",
            icon_url=ctx.author.avatar.url,
            description=f"{str(message)}",
            media=f"{random.choice(benResponses)}",
            color="#e9196c",
        )
        await ctx.send(content="[]()", embed=embed)

    @image.command(description="Give someone a hug!")
    async def hug(ctx, member: voltage.Member = None, message: str = None):
        if member is None:
            member = ctx.author
            async with aiohttp.ClientSession() as session:
                img = await session.get(f"http://api.nekos.fun:8080/api/hug")
                imgjson = await img.json()
                embed = voltage.SendableEmbed(
                    title=f"{ctx.author.name}",
                    icon_url=ctx.author.avatar.url,
                    description=f"{ctx.author.name} hugs.. themself? How lonely **are** you? [yikes..]({imgjson['image']})",
                    media=f"{imgjson['image']}",
                    color="#e9196c",
                )
                return await ctx.send(content="[]()", embed=embed)
        async with aiohttp.ClientSession() as session:
            img = await session.get(f"http://api.nekos.fun:8080/api/hug")
            imgjson = await img.json()
            embed = voltage.SendableEmbed(
                title=f"{ctx.author.name}",
                icon_url=ctx.author.avatar.url,
                description=f"{ctx.author.name} hugged {member.display_name} [🤗]({imgjson['image']})!",
                media=f"{imgjson['image']}",
                color="#e9196c",
            )
        await ctx.send(content="[]()", embed=embed)

    @image.command(description="Give someone a kiss!")
    async def kiss(ctx, member: voltage.Member = None):
        if member is None:
            member = ctx.author
            async with aiohttp.ClientSession() as session:
                img = await session.get(f"http://api.nekos.fun:8080/api/kiss")
                imgjson = await img.json()
                embed = voltage.SendableEmbed(
                    title=f"{ctx.author.name}",
                    icon_url=ctx.author.avatar.url,
                    description=f"{ctx.author.name} kiss.. themself? How lonely **are** you? [yikes..]({imgjson['image']})",
                    media=f"{imgjson['image']}",
                    color="#e9196c",
                )
                return await ctx.send(content="[]()", embed=embed)
        async with aiohttp.ClientSession() as session:
            img = await session.get(f"http://api.nekos.fun:8080/api/kiss")
            imgjson = await img.json()
            embed = voltage.SendableEmbed(
                title=f"{ctx.author.name}",
                icon_url=ctx.author.avatar.url,
                description=f"{ctx.author.name} kissed {member.display_name} [😘]({imgjson['image']})!",
                media=f"{imgjson['image']}",
                color="#e9196c",
            )
        await ctx.send(content="[]()", embed=embed)

    @image.command(description="Give someone a slap!")
    async def slap(ctx, member: voltage.Member = None):
        if member is None:
            member = ctx.author
            async with aiohttp.ClientSession() as session:
                img = await session.get(f"http://api.nekos.fun:8080/api/slap")
                imgjson = await img.json()
                embed = voltage.SendableEmbed(
                    title=f"{ctx.author.name}",
                    icon_url=ctx.author.avatar.url,
                    description=f"{ctx.author.name} slaps.. themself? How lonely **are** you? [yikes..]({imgjson['image']})",
                    media=f"{imgjson['image']}",
                    color="#e9196c",
                )
                return await ctx.send(content="[]()", embed=embed)
        async with aiohttp.ClientSession() as session:
            img = await session.get(f"http://api.nekos.fun:8080/api/slap")
            imgjson = await img.json()
            embed = voltage.SendableEmbed(
                title=f"{ctx.author.name}",
                icon_url=ctx.author.avatar.url,
                description=f"{ctx.author.name} slapped {member.display_name} [🤚]({imgjson['image']})!",
                media=f"{imgjson['image']}",
                color="#e9196c",
            )
        await ctx.send(content="[]()", embed=embed)

    @image.command(description="Give someone a pat!")
    async def pat(ctx, member: voltage.Member = None):
        if member is None:
            member = ctx.author
            async with aiohttp.ClientSession() as session:
                img = await session.get(f"http://api.nekos.fun:8080/api/pat")
                imgjson = await img.json()
                embed = voltage.SendableEmbed(
                    title=f"{ctx.author.name}",
                    icon_url=ctx.author.avatar.url,
                    description=f"{ctx.author.name} pats.. themself? How lonely **are** you? [yikes..]({imgjson['image']})",
                    media=f"{imgjson['image']}",
                    color="#e9196c",
                )
                return await ctx.send(content="[]()", embed=embed)
        async with aiohttp.ClientSession() as session:
            img = await session.get(f"http://api.nekos.fun:8080/api/pat")
            imgjson = await img.json()
            embed = voltage.SendableEmbed(
                title=f"{ctx.author.name}",
                icon_url=ctx.author.avatar.url,
                description=f"{ctx.author.name} patting {member.display_name} [:pat:]({imgjson['image']})!",
                media=f"{imgjson['image']}",
                color="#e9196c",
            )
        await ctx.send(content="[]()", embed=embed)

    return image
