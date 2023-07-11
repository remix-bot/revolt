const { workerData, parentPort } = require('worker_threads');
const EventEmitter = require("events");
const yts = require('yt-search');
const Spotify = require("spotifydl-core").default;
const scdl = require("soundcloud-downloader").default;
const YoutubeMusicApi = require('youtube-music-api-fix')

if (!workerData) {
  console.log("Worker data shouldn't be empty!");
  process.exit(0);
}

class YTUtils extends EventEmitter {
  constructor(spotify) {
    super();

    this.spotifyClient = null
    this.spotifyConfig = spotify;
    this.ytApi = null;

    return this;
  }
  get api() {
    this.ytApi ||= new YoutubeMusicApi();
    return this.ytApi
  }
  get spotify() {
    this.spotifyClient ||= new Spotify(this.spotifyConfig);
    return this.spotifyClient;
  }
  init() {
    if (Object.keys(this.api.ytcfg).length > 0) return true; // already initalized
    return this.api.initalize();
  }
  error(data) {
    this.emit("error", data);
  }
  prettifyTimestamp(ms) {
    let mins = Math.floor(ms / 1000 / 60);
    let secs = Math.floor(60 * ((ms / 1000/ 60) - mins));

    let p = (n) => {
      if (("" + n).length > 1) return "" + n;
      return "0" + n;
    }
    let f = (t, curr=[]) => {
      if (t < 60) {curr.push(p(t)); return curr.join(":");}
      let nt = Math.floor(t / 60);
      curr.push(p(nt));
      return f(nt, curr);
    }
    return f(mins) + ":" + p(secs);
  }
  youtubeParser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
  }
  liveParser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?)|(live\/))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[8]) ? match[8] : false;
  }
  playlistParser(url) {
    var match = url.match(/[&?]list=([^&]+)/i);
    return (match || [0, false])[1];
  }
  async getResults(query, limit, provider) { // TODO: implement forwards/backwards feature
    switch(provider){
      case "yt":
        var videos = (await yts(query)).videos;
        videos = videos.slice(0, Math.min(limit, videos.length));
        return {
          data: videos
        };
      case "ytm":
        await this.init();
        // TODO: add support for albums, playlists, artists and videos
        // TODO: improve above by editing youtube search package to include all
        var results = (await this.api.search(query, "song")).content;
        results = results.map(result => {
          let r = {...result};
          r.title = result.name
          r.url = `https://music.youtube.com/watch?v=${result.videoId}`;
          r.thumbnail = (Array.from(result.thumbnails).sort((a, b) => b.width - a.width)[0] || {}).url;
          r.artists = ((Array.isArray(result.artist)) ?Array.from(result.artist) : [result.artist]).map(a => (a.url = `https://music.youtube.com/channel/${a.browseId}`, a))
          return r;
        }).slice(0, Math.min(limit, results.length));
        return {
          data: results
        }
    }
  }

  async getPlaylistData(playlist, query) {
    // TODO: add youtube music playlist loading
    this.emit("message", "Loading playlist items... (This may take a while)");
    var videos;
    try {
      videos = await this.fetchPlaylist(playlist);
      videos = videos.map((v) => {
        v.url = "https://music.youtube.com/watch?v=" + v.videoId;
        return v;
      });
    } catch (e) {
      this.error(e);
      this.emit("message", "Failed to load playlist. Maybe it's private?");
      return false;
    }
    let parsed = this.youtubeParser(query);
    if (videos) { this.emit("message", "Successfully added " + videos.length + " songs to the queue."); } else { this.emit("message", "**There was an error fetching the playlist '" + parsed + "'!**"); return false; };
    return { type: "list", data: videos };
  }
  getSpotifyAlbum(id, type="album") {
    return new Promise(async (res) => {
      this.emit("message", "Loading " + type + " songs... (This may take a while)");
      const album = await ((type == "album") ? this.spotify.getAlbum : this.spotify.getPlaylist)("https://open.spotify.com/" + type + "/" + id);
      var load = (trackId) => {
        return new Promise(async res => {
          const track = await this.spotify.getTrack("https://open.spotify.com/track/" + trackId);
          res(await this.search(track.name + " " + track.artists[0]))
        });
      }
      Promise.allSettled(album.tracks.map(a => load(a))).then((d) => {
        d = d.map(e=>e.value);
        this.emit("message", "Successfully added " + d.length + " songs to the queue.");
        res({ type: "list", data: d});
      });
    });
  }
  getSpotifyPlaylist(id) {
    return this.getSpotifyAlbum(id, "playlist")
  }
  async getByQuery(query, provider) { // either yt or ytm
    this.emit("message", "Searching...");
    if (provider === "ytm") {
      await this.init();
      const results = (await this.api.search(query, "song")).content;
      const song = results[0];
      if (!song) { this.emit("message", "**There was an error loading the youtube music song using the query '" + query + "'!**"); return false;}
      const r = {...song};
      r.title = song.name;
      r.url = `https://music.youtube.com/watch?v=${song.videoId}`;
      r.thumbnail = (Array.from(song.thumbnails).sort((a, b) => b.width - a.width)[0] || {}).url;
      r.artists = ((Array.isArray(song.artist)) ?Array.from(song.artist) : [song.artist]).map(a => (a.url = `https://music.youtube.com/channel/${a.browseId}`, a))
      this.emit("message",  `Successfully added [${r.title}](${r.url}) to the queue.`)
      return { type: "video", data: r };
    }
    let video = await this.search(query);
    if (video) { this.emit("message", `Successfully added [${video.title}](${video.url}) to the queue.`); } else { this.emit("message", "**There was an error loading a youtube video using the query '" + query + "'!**") };
    if (!video) return false;
    return { type: "video", data: video };
  }
  async getById(parsedId, live) {
    this.emit("message", "Loading video data...");
    let video = await this.search(parsedId, true);
    if (video) { this.emit("message", "Successfully added to the queue."); } else { this.emit("message", "**There was an error loading the youtube video with the id '" + parsedId + "'!**" ) };
    if (!video) return false;
    if (live) {
      video.duration.timestamp = "live";
      video.url = "https://youtube.com/live/" + parsedId;
    }
    return { type: "video", data: video };
  }
  async getBySpotifyId(id){
    this.emit("message", "Loading video data...");
    let song = await this.spotify.getTrack("https://open.spotify.com/track/" + id);
    this.emit("message", "Successfully added to the queue.");
    /*let d = {
      title: song.name,
      url: "https://open.spotify.com/track/" + id,
      thumbnail: song.cover_url,
      type: "spotify"
    }*/
    return await this.getByQuery(song.name + " " + song.artists[0]);
  }
  async getVideoData(query, provider="yt") {
    if (this.isSoundCloud(query)) return await this.getScdl(query);
    if (this.isSpotify(query)) return await this.getSpotifyData(query);

    let playlist = this.playlistParser(query);
    // fetch playlist data
    if (playlist) return await this.getPlaylistData(playlist, query);

    let parsed = this.youtubeParser(query);
    if (!parsed) {
      const live = this.liveParser(query);
      if (!live) return await this.getByQuery(query, provider); // not a yt id
      return await this.getById(live, true);
    }
    // fetch youtube video data by id
    return await this.getById(parsed);
  }
  async search(string, id) {
    return (id) ? await yts({ videoId: string }) : (await yts(string)).videos[0];
  }
  async fetchPlaylist(id) {
    return (await yts({ listId: id })).videos;
  }
  isSpotify(str) {
    return /^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/.test(str);
  }
  async getSpotifyData(query) {
    const match = query.match(/^(?:spotify:|(?:https?:\/\/(?:open|play)\.spotify\.com\/))(?:embed)?\/?(album|track|playlist)(?::|\/)((?:[0-9a-zA-Z]){22})/);
    if (!match) return null;
    const type = match[1];
    const id = match[2];
    if (type == "album") return await this.getSpotifyAlbum(match[2]);
    if (type == "playlist") return await this.getSpotifyPlaylist(match[2]);

    return await this.getBySpotifyId(id);
  }
  parseScdlInput(i) {
    const regex = /(?<url>((https:\/\/)|(http:\/\/)|(www.)|(m\.)|(\s))+(soundcloud.com\/)+(?<artist>[a-zA-Z0-9\-\.]+)(\/)+(?<id>[a-zA-Z0-9\-\.]+))/gmi;
    const res = regex.exec(i);
    if (!res) return false;
    return res.groups;
  }
  isSoundCloud(query) {
    return !!this.parseScdlInput(query);
  }
  // TODO: soundcloud albums, playlists
  async getScdl(query) {
    const data = this.parseScdlInput(query);

    this.emit("message", "Loading SoundCloud info...");
    const info = await scdl.getInfo(data.url)
    this.emit("message", "Successfully added to queue.");
    return {
      type: "video",
      data: {
        type: "soundcloud",
        url: data.url,
        thumbnail: info.artwork_url,
        duration: {
          timestamp: this.prettifyTimestamp(info.full_duration)
        },
        title: info.title,
        author: {
          name: info.user.username,
          url: info.user.permalink_url
        }
      }
    }
  }
}

const jobId = workerData.jobId;
const data = workerData.data;
const utils = new YTUtils(data.spotify);
utils.on("message", (content) => {
  post("message", content);
});
utils.on("error", (msg) => {
  post("error", msg);
});

const post = (event, data) => {
  return parentPort.postMessage(JSON.stringify({ event: event, data: data }));
}

(async () => {
  var r = null;
  switch(jobId) {
    case "search":
      let result = await utils.search(data, true);
      post("finished", result);
    break;
    case "generalQuery":
      r = (await utils.getVideoData(data.query, data.provider));
      post("finished", r);
    break;
    case "searchResults":
      r = await utils.getResults(data.query, data.resultCount, data.provider);
      post("finished", r);
    break;
    default:
      console.log("Invalid jobId");
      process.exit(0);
  }
  process.exit(1);
})();
