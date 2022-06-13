import random

import voltage
from voltage.ext.commands import SubclassedCog


def setup(client: voltage.Client) -> SubclassedCog:
    fun = SubclassedCog("Fun", "Random and fun stuff.")

    @fun.command(name="8ball", description="Seek your fortune!")
    async def _8ball(ctx, *, message: str = None) -> None:
        if message == None:
            return await ctx.send("provide something for me to say you idiot")
        responses = [
            "Yes.",
            "It is certain.",
            "It is decidedly so.",
            "Without a doubt.",
            "Yes definelty.",
            "You may rely on it.",
            "As I see it, yes.",
            "Most likely.",
            "Outlook good.",
            "Signs point to yes.",
            "Reply hazy, try again.",
            "Ask again later.",
            "Better not tell you now...",
            "Cannot predict now.",
            "Concentrate and ask again.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good...",
            "Very doubtful.",
            "My reply is no.",
        ]
        embed = voltage.SendableEmbed(
            title=f"{ctx.author.name}",
            icon_url=ctx.author.avatar.url,
            description=f"""My response to `{str(message)}`...\n `{random.choice(responses)}`!""",
            color="#e9196c",
        )
        await ctx.send(content="[]()", embed=embed)

    @fun.command(description="Rolls a die for you.")
    async def roll(ctx, sides: int = 6) -> None:
        await ctx.send(f"You rolled a **{random.randint(1, sides)}**")

    @fun.command(description="Flips a coin for you")
    async def coinflip(ctx) -> None:
        await ctx.send(f"Your coin landed on **{random.choice(['heads', 'tails'])}**")

    @fun.command(
        description="Sends a user-provided message. Pretty useless, but it's there. Note: Use the backslash to escape newlines, quotation marks, and other special characters."
    )
    async def say(ctx, *, message: str = None) -> None:
        prefix = await ctx.client.get_prefix(ctx.message, ctx.client.prefix)
        if message == None:
            return await ctx.send("provide something for me to say you idiot")
        elif message.startswith(prefix):
            return await ctx.send("stop ratelimiting me lmfao")
        await ctx.send(message)

    @fun.command(description="Are you gay or no?")
    async def gay(ctx, member: voltage.Member = None):
        if member is None:
            member = ctx.author
        rate = random.randint(1, 100)
        embed = voltage.SendableEmbed(
            title=f"{ctx.author.name}",
            icon_url=ctx.author.avatar.url,
            description=f"🏳️‍🌈 | {member.display_name} is `{str(rate)}%` gay!",
            color="#e9196c",
        )
        await ctx.send(content="[]()", embed=embed)

    return fun
