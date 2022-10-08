const yts = require('yt-search');
const events = require('events');

class YTUtils {
  constructor() {
    this.events = new events.EventEmitter();

    return this;
  }
  on(event, callback) {
    this.events.on(event, callback);
  }
  once(event, callback) {
    this.events.once(event, callback);
  }
  error(data) {
    this.events.emit("error", data);
  }

  async getVideoData(query) {
    let playlist = this.playlistParser(query);
    if (playlist) {
      this.events.emit("message", { content: "Loading Playlist items..." });
      var videos;
      try {
        videos = await this.fetchPlaylist(playlist);
      } catch (e) {
        this.error(e);
        this.events.emit("message", { content: "Failed to load playlist. Maybe it's unviewable?" });
        return false;
      }
      let parsed = this.youtubeParser(query);
      if (videos) { this.events.emit("message", { content: "Successfully added " + videos.length + " songs to queue." }); } else { this.events.emit("message", { content: "**There was an error fetching the playlist '" + parsed + "'!**" }); return false; };
      return { type: "list", data: videos };
    } else {
      let parsed = this.youtubeParser(query);
      if (!parsed) {
        this.events.emit("message", { content: "Searching..." });
        let video = await this.search(query);
        if (video) { this.events.emit("message", { content: "Successfully added to queue." }); } else { this.events.emit("message", { content: "**There was an error loading a youtube video using the query '" + query + "'!**" }) };
        if (!video) return false;
        return { type: "video", data: video };
      } else {
        this.events.emit("message", { content: "Loading video data..." });
        let video = await this.search(parsed, true);
        if (video) { this.events.emit("message", { content: "Successfully added to queue." }); } else { this.events.emit("message", { content: "**There was an error loading the youtube video with the id '" + parsed + "'!**" }) };
        if (!video) return false;
        return { type: "video", data: video };
      }
    }
  }
  async search(string, id) {
    return (id) ? await yts({ videoId: id }) : (await yts(string)).videos[0];
  }
  async fetchPlaylist(id) {
    return (await yts({ listId: id })).videos;
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
}

const { workerData, parentPort } = require('worker_threads');

const utils = new YTUtils();
utils.events.on("message", (data) => {
  parentPort.postMessage(JSON.stringify(data));
});
utils.events.on("error", (data) => {
  console.error("worker error: " + data);
});
if (workerData) {
  if (workerData.type == "command") {
    utils.getVideoData(workerData.query).then((videoData) => {
      parentPort.postMessage(JSON.stringify(videoData));
    }).catch((e) => {
      console.log("command error: ", e);
      process.exit(0);
    });
  } else if (workerData.type == "voiceCommand") {
    utils.search(workerData.query, false).then((videoData) => {
      if (videoData) {
        parentPort.postMessage({ type: "video", data: JSON.stringify(videoData) });
      } else {
        parentPort.postMessage("false");
      }
    }).catch(error => {
      console.log("voice command error: ", error);
      process.exit(0);
    });
  }
}
