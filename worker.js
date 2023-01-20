const { workerData, parentPort } = require('worker_threads');
const EventEmitter = require("events");
const yts = require('yt-search');
const Spotify = require("spotifydl-core").default;
const scdl = require("soundcloud-downloader").default;

if (!workerData) {
  console.log("Worker data shouldn't be empty!");
  process.exit(0);
}

class YTUtils extends EventEmitter {
  constructor(spotify) {
    super();

    this.spotify = new Spotify(spotify);

    return this;
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
  playlistParser(url) {
    var match = url.match(/[&?]list=([^&]+)/i);
    return (match || [0, false])[1];
  }

  async getPlaylistData(playlist, query) {
    this.emit("message", "Loading playlist items... (This may take a while)");
    var videos;
    try {
      videos = await this.fetchPlaylist(playlist);
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
  async getByQuery(query) {
    this.emit("message", "Searching...");
    let video = await this.search(query);
    if (video) { this.emit("message", `Successfully added [${video.title}](${video.url}) to the queue.`); } else { this.emit("message", "**There was an error loading a youtube video using the query '" + query + "'!**") };
    if (!video) return false;
    return { type: "video", data: video };
  }
  async getById(parsedId) {
    this.emit("message", "Loading video data...");
    let video = await this.search(parsedId, true);
    if (video) { this.emit("message", "Successfully added to the queue."); } else { this.emit("message", "**There was an error loading the youtube video with the id '" + parsedId + "'!**" ) };
    if (!video) return false;
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
  async getVideoData(query) {
    if (this.isSoundCloud(query)) return await this.getScdl(query);
    if (this.isSpotify(query)) return await this.getSpotifyData(query);

    let playlist = this.playlistParser(query);
    // fetch playlist data
    if (playlist) return await this.getPlaylistData(playlist, query);

    let parsed = this.youtubeParser(query);
    if (!parsed) return await this.getByQuery(query); // not a yt id
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
  switch(jobId) {
    case "search":
      let result = await utils.search(data, true);
      post("finished", result);
    break;
    case "generalQuery":
      let r = (await utils.getVideoData(data.query));
      post("finished", r);
    break;
    default:
      console.log("Invalid jobId");
      process.exit(0);
  }
  process.exit(1);
})();
