const { workerData, parentPort } = require('worker_threads');
const EventEmitter = require("events");
const yts = require('yt-search');

if (!workerData) {
  console.log("Worker data shouldn't be empty!");
  process.exit(0);
}

class YTUtils extends EventEmitter {
  constructor() {
    super();

    return this;
  }
  error(data) {
    this.emit("error", data);
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

  async getPlaylistData(playlist) {
    this.emit("message", "Loading playlist items...");
    var videos;
    try {
      videos = await this.fetchPlaylist(playlist);
    } catch (e) {
      this.error(e);
      this.emit("message", "Failed to load playlist. Maybe it's unlisted?");
      return false;
    }
    let parsed = this.youtubeParser(query);
    if (videos) { this.emit("message", "Successfully added " + videos.length + " songs to queue."); } else { this.emit("message", "**There was an error fetching the playlist '" + parsed + "'!**"); return false; };
    return { type: "list", data: videos };
  }
  async getByQuery(query) {
    this.emit("message", "Searching...");
    let video = await this.search(query);
    if (video) { this.emit("message", "Successfully added to queue."); } else { this.emit("message", "**There was an error loading a youtube video using the query '" + query + "'!**") };
    if (!video) return false;
    return { type: "video", data: video };
  }
  async getById(parsedId) {
    this.emit("message", "Loading video data...");
    let video = await this.search(parsedId, true);
    if (video) { this.emit("message", "Successfully added to queue."); } else { this.emit("message", "**There was an error loading the youtube video with the id '" + parsedId + "'!**" ) };
    if (!video) return false;
    return { type: "video", data: video };
  }
  async getVideoData(query) {
    let playlist = this.playlistParser(query);
    // fetch playlist data
    if (playlist) return await this.getPlaylistData(playlist);

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
}

const jobId = workerData.jobId;
const data = workerData.data;
const utils = new YTUtils();
utils.on("message", (content) => {
  post("message", content);
});
utils.on("error", (msg) => {
  post("error", msg);
});

const post = (event, data) => {
  return parentPort.postMessage(JSON.stringify({ event, data }));
}

(async () => {
  switch(jobId) {
    case "search":
      let result = await utils.search(data, true);
      post("finished", result);
    break;
    case "generalQuery":
      post("finished", utils.getVideoData(data));
    break;
    default:
      console.log("Invalid jobId");
      process.exit(0);
  }
})();
