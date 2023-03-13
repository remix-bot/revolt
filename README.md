<p align="center">
    <a href="https://github.com/remix-bot">
        <img src="https://i.imgur.com/dt5Ppu6.jpg" alt="Logo" width="80" height="80">
      </a>
    <h2 align="center">Remix</h2>
    <p align="center">
    The best high quality Revolt music bot.
        <br>
        <a href="https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW">Invite to your server</a>
        ·
        <a href="https://app.revolt.chat/invite/qvJEsmPt">Report bug</a>
        ·
        <a href="https://app.revolt.chat/invite/qvJEsmPt"> Request Feature</a>
    <a/>


## About The Project

Remix is a free and open source music bot for Revolt built on [revoice.js](https://github.com/ShadowLp174/revoice.js). All commands on Remix are free and will always be free to use.

## Commands  

Below is a table of all of Remix's commands.

|Name|Description|Format|Alias|
|---|---|---|---|
|clear|Remove all songs from the queue.|%clear|clear, c|
|join|Make the bot join a specific voice channel.|%join 'Channel ID: channel'|join|
|leave|Make the bot leave your current voice channel|%leave|leave, l|
|list|List the queue in your current voice channel.|%list|list, queue|
|loop|Toggle the looping of your queue/song.|%loop <queue \| song>|loop|
|np|Request the name and url of the currently playing song.|%np|np, current, nowplaying|
|pause|Pause the playback in your voice channel|%pause|pause|
|play|Play a youtube video from url/query or a playlist by url.|%play 'query: text'|play, p|
|player|Create an emoji player control for your voice channel|%player|player|
|playnext|Play a youtube video from url/query or a playlist by url. The result will be added to the top of the queue.|%playnext 'query: text'|playnext, pn|
|remove|Remove a specific song from the queue.|%remove 'index: number'|remove|
|resume|Resume the playback in your voice channel|%resume|resume|
|search|Display the search results for a given query|%search 'query: text'|search|
|settings|Change/Get settings in the current server.|settings <set \| get>|%settings, s|
|shuffle|Re-orders the queue randomly.|%shuffle|shuffle|
|skip|Skip the current playing song.|%skip|skip|
|stats|Display stats about the bot like the uptime.|%stats|stats, info|
|test|A test command used for various purposes.|%test 'number: number'|test|
|thumbnail|Request the thumbnail of the currently playing song.|%thumbnail|thumbnail, thumb|
|volume|Change the current volume.|%volume 'volume: number'|volume, v|


## Getting Started

Firstly, if you have already invited Remix (If not, go ahead and do it now!) and then You can use the (%help) command to get a list of commands that you can use in the bot.

## Hosting The Bot

If you're intending on self-hosting, please make it clear that it is **not the main instance** (or **change the name**) but give credit by **linking to this repo** (for example, in the bot's profile - something like `This bot <is based on/is an instance of> [Remix](https://github.com/remix-bot/revolt)` will suffice).

-   Clone this repo (`git clone https://github.com/remix-bot/revolt.git)`)
-   Install the dependencies (`npm install`)
-   Set up a `config.json` file
    - Rename the `config.example.json` file and fill out the missing values. You can generate spotify credentials [here](https://developer.spotify.com/)
-   Run the bot (`node index.js`)

## Contact

If you have any questions or would like to talk with other Remix users you can join our <a href="https://app.revolt.chat/invite/qvJEsmPt"> Revolt server here</a>.
