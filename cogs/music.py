import voltage
from voltage.ext.commands import SubclassedCog


def setup(client: voltage.Client) -> SubclassedCog:
    music = SubclassedCog("Music", "Music Stuff that wouldn't fit anywhere else.")

    @music.command(description="test")
    async def join(ctx, channel_id: str):
        channel = await ctx.channel()
        await channel.joinCall()
        embed = voltage.SendableEmbed(
            title="test",
            description=f"`test`",
            colour="#e9196c",
        )
        await ctx.send(embed=embed)

    return music
