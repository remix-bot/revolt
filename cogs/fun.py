import asyncio
import math
import random

import voltage
from voltage.ext.commands import SubclassedCog


class TickTackToeGame:
    """A simple class which represents and handles a game of tick tack toe"""

    def __init__(self, player1: voltage.Member, player2: voltage.Member):
        self.player = player1
        self.players = [player1, player2]
        self.board = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
        self.turn = 0
        self.winner = None
        self.draw = False

    def render_board(self):
        """Renders the board as a string"""
        board = str()
        symbols = [
            "$\\textcolor{red}{\\textsf{X}}$",
            "$\\textcolor{yellow}{\\textsf{O}}$",
        ]
        for i, row in enumerate(self.board):
            board += "|"
            if i == 1:
                board += "---|---|---|\n"
            for j, cell in enumerate(row):
                if cell == 1:
                    symbol = symbols[0]
                elif cell == -1:
                    symbol = symbols[1]
                else:
                    symbol = str(i * 3 + j + 1)
                board += f" {symbol} |"
            board += "\n"
        return board

    def check_winner(self):
        for i in self.board:
            if i[0] == i[1] == i[2] != 0:
                self.winner = self.player
                return True
        for i in range(3):
            if self.board[0][i] == self.board[1][i] == self.board[2][i] != 0:
                self.winner = self.player
                return True
        if self.board[0][0] == self.board[1][1] == self.board[2][2] != 0:
            self.winner = self.player
            return True
        if self.board[0][2] == self.board[1][1] == self.board[2][0] != 0:
            self.winner = self.player
            return True
        if 0 not in self.board[0] and 0 not in self.board[1] and 0 not in self.board[2]:
            self.draw = True
            return True
        return False

    def make_move(self, place: int):
        """Makes a move on the board"""
        x, y = math.ceil(place / 3), (place - 1) % 3
        x -= 1
        self.board[x][y] = 1 if self.turn % 2 == 0 else -1
        self.turn += 1
        self.player = self.players[self.turn % 2]

    def __str__(self):
        return f"{self.player}'s turn\n{self.render_board()}"

    @property
    def available(self):
        """Returns a list of available moves"""
        available = []
        for i in range(3):
            for j in range(3):
                if self.board[i][j] == 0:
                    available.append(i * 3 + j + 1)
        return available

    @property
    def is_over(self):
        """Returns whether the game is over"""
        self.check_winner()
        return self.winner is not None or self.draw


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

    @fun.command(description="Are you gay or no?")
    async def ship(ctx, member: voltage.Member = None):
        if member is None:
            member = ctx.author
        rate = random.randint(1, 100)
        embed = voltage.SendableEmbed(
            title=f"{ctx.author.name}",
            icon_url=ctx.author.avatar.url,
            description=f"💖 | {member.display_name} loves himself this much `{str(rate)}%` :trol:!",
            color="#e9196c",
        )
        await ctx.send(content="[]()", embed=embed)

    @fun.command(description="Are you gay or no?")
    async def sus(ctx, member: voltage.Member = None):
        if member is None:
            member = ctx.author
        embed = voltage.SendableEmbed(
            title=f"{ctx.author.name}",
            icon_url=ctx.author.avatar.url,
            description=f"{member.display_name} is **{random.randint(0, 100)}%** sus :amogus:",
            color="#e9196c",
        )
        await ctx.send(content="[]()", embed=embed)

    @fun.command()
    async def tto(ctx, member: voltage.Member):
        """Face someone in the ultimate game of skill, Tic-Tac-Toe."""
        msg = await ctx.send(
            f"{ctx.author.display_name} challenged {member.display_name} to an epic game of Tic-Tac-Toe"
        )
        game = TickTackToeGame(ctx.author, member)
        while not game.is_over:
            await asyncio.sleep(1)
            await msg.edit(game)
            try:
                place = int(
                    (
                        await client.wait_for(
                            "message",
                            timeout=60,
                            check=lambda m: m.author == game.player
                            and m.channel == ctx.channel
                            and m.content in "".join([str(i) for i in game.available]),
                        )
                    ).content
                )
            except asyncio.TimeoutError:
                await ctx.send(f"{member.display_name} forfeited!")
                break
            game.make_move(place)
        await msg.edit(game)
        if game.draw:
            await ctx.send(f"{ctx.author.display_name} and {member.display_name} tied!")
        elif game.winner == ctx.author:
            await ctx.send(f"{member.display_name} won!")
        else:
            await ctx.send(f"{ctx.author.display_name} won!")

    @fun.command()
    async def fight(ctx, member: voltage.Member):
        """Fight someone."""
        msg = await ctx.reply(f"{ctx.author.display_name} is fighting {member.display_name}")
        await asyncio.sleep(3)
        await msg.edit("3")
        await asyncio.sleep(1)
        await msg.edit("2")
        await asyncio.sleep(1)
        await msg.edit("1")
        await asyncio.sleep(1)
        await msg.edit("FIGHT")
        await asyncio.sleep(1)
        hp1 = hp2 = 100
        while hp1 > 0 and hp2 > 0:
            dmg = random.randint(0, 10)
            hp1 = max(hp1 - dmg, 0)
            await msg.edit(
                f"{member.display_name} hit {ctx.author.display_name} for {dmg} damage. {ctx.author.display_name} has {hp1} HP left."
            )
            if hp1 <= 0:
                break
            await asyncio.sleep(1)
            dmg = random.randint(0, 10)
            hp2 = max(hp2 - dmg, 0)
            await msg.edit(
                f"{ctx.author.display_name} hit {member.display_name} for {dmg} damage. {member.display_name} has {hp2} HP left."
            )
            if hp2 <= 0:
                break
            await asyncio.sleep(1)
        if hp1 > 0:
            await ctx.send(f"{ctx.author.display_name} won!")
        else:
            await ctx.send(f"{member.display_name} won!")

    return fun
