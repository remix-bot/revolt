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
    <a href="https://app.revolt.chat/invite/Remix">Report bug</a>
      ·
    <a href="https://app.revolt.chat/invite/Remix"> Request Feature</a>
  </p>
</p>

## About The Project

Remix is a free and open source music bot for Revolt built on [revoice.js](https://github.com/ShadowLp174/revoice.js). All commands on Remix are free and will always be free to use.

[![Wakatime stats](https://wakatime.com/badge/user/810f765c-4ad8-49cc-8be6-0f07dff3733f/project/e79f62e3-4d15-41fc-b239-53d5a30302c7.svg?style=flat)](https://wakatime.com/badge/user/810f765c-4ad8-49cc-8be6-0f07dff3733f/project/e79f62e3-4d15-41fc-b239-53d5a30302c7)

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
|settings|Change/Get settings in the current server.|%settings <set \| get>|settings, s|
|shuffle|Re-orders the queue randomly.|%shuffle|shuffle|
|skip|Skip the current playing song.|%skip|skip|
|stats|Display stats about the bot like the uptime.|%stats|stats, info|
|test|A test command used for various purposes.|%test 'number: number'|test|
|thumbnail|Request the thumbnail of the currently playing song.|%thumbnail|thumbnail, thumb|
|volume|Change the current volume.|%volume 'volume: number'|volume, v|


## Getting Started

Firstly, you have to [invite Remix](https://app.revolt.chat/bot/01FVB28WQ9JHMWK8K7RD0F0VCW). Then use the `%help` command to get a list of commands that you can use through the bot.

<!-- TODO: more extensive tutorial -->

## Hosting The Bot

If you're self-hosting Remix, please make it clear that it is **not the main instance** (or **change the name**) but give credit by **linking to this repo** (for example, in the bot's profile - something like `This bot <is based on/is an instance of> [Remix](https://github.com/remix-bot/revolt)` will suffice).

-   Clone this repo (`git clone https://github.com/remix-bot/revolt.git)`)
-   Install the dependencies (`npm install`)
-   Set up a `config.json` file
    - Rename the `config.example.json` file and fill out the missing values. You can generate spotify credentials [here](https://developer.spotify.com/)
-   Run the bot (`node index.js`)

## Connecting To A Self-Hosted Instance

If you don't want to connect to the official Revolt instance, you need to fill out the `revolt.js` and `revolt-api` configuration values in your config file.

Please refer to the [revolt.js docs](https://revolt.js.org/classes/Client.html#constructor) for `revolt.js` and to [oapi's docs](https://github.com/insertish/oapi#example) for `revolt-api`.

## Contact

If you have any questions or would like to talk with other Remix users you can join our Revolt server <a href="https://app.revolt.chat/invite/Remix">here</a>.

---

&copy; 2023 Remix. All Rights Reserved.
