const { Revoice, MediaPlayer } = require("revoice.js");
const { Worker } = require('worker_threads');
const ytdl = require('ytdl-core');
const yts = require("yt-search");
const EventEmitter = require("events");

class RevoltPlayer {
  constructor(token, ytKey="null", opts) {
    this.events = new EventEmitter();

    this.voice = opts.voice || new Revoice(token);
    this.connection = {
      state: Revoice.State.OFFLINE
    }

    this.YT_API_KEY = ytKey;
    this.REVOLT_CHAR_LIMIT = 1950;
    this.token = token;
    this.port = 3050 + opts.portOffset;

    this.state = Revoice.State.OFFLINE;
    this.data = {
      queue: [],
      current: null,
      loop: false,
      queueSong: false // wether to loop the current song regardless of the queue
    }

    return this;
  }
  log(data) {
    this.events.emit("log", data);
  }
  error(data) {
    this.events.emit("error", data);
  }
  on(event, handler) {
    this.events.on(event, handler);
  }
  once(event, handler) {
    this.events.once(event, handler);
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
  async search(string) {
    return (await yts(string)).videos[0];
  }
  async fetchPlaylist(id) {
    return (await yts({ listId: id })).videos;
  }
  shuffleArr(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }
  async addIdToQueue(id) {
    try {
      this.data.queue.push(await yts({ videoId: id }));
      return true;
    } catch (e) {
      this.error("There was error fetching video data: ", e);
      return false;
    }
  }
  addToQueue(data) {
    this.data.queue.push(data);
  }
  shuffle() {
    if (this.data.queue.length == 0) return "The is nothing to shuffle in the queue.";
    this.data.queue = this.shuffleArr(this.data.queue);
    return true;
  }

  playNext() {
    if (this.data.queue.length === 0) { this.data.current = null; return false; }
    const current = this.data.current;
    const data = (this.data.queueSong) ? current : this.data.queue.shift();
    if (current && this.data.loop && !this.data.queueSong) this.data.queue.push(current);

    this.data.current = data;
    const connection = this.voice.getVoiceConnection(this.connection.channelId);
    connection.media.playStream(ytdl("https://www.youtube.com/watch?v=" + data.videoId, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1024 * 1024 * 10, // 10mb
      requestOptions: {
        headers: {
          "Cookie": "ID=" + new Date().getTime(),
          "x-youtube-identity-token": this.YT_API_KEY
        }
      }
    }, { highWaterMark: 1048576 / 4 }));
  }
  resume() {
    return this.player.resume();
  }
  pause() {
    return this.player.pause();
  }
  skip() {
    this.player.stop();
  }
  clear() {
    this.data.queue = [];
  }

  getVidName(vid, code) {
    if (code) return vid.title + " (" + vid.duration.timestamp + ") - " + vid.url;
    return "[" + vid.title + " (" + vid.duration.timestamp + ")" + "](" + vid.url + ")";
  }
  msgChunking(msg) {
    let msgs = [[""]];
    let c = 0;
    msg.split("\n").forEach((line) => {
      let tmp = msgs[c].slice();
      tmp.push(line);
      if ((tmp.join("") + "\n").length < this.REVOLT_CHAR_LIMIT) {
        msgs[c].push(line + "\n");
      } else {
        msgs[++c] = [line + "\n"];
      }
    });
    msgs = msgs.map(msgChunks => "```" + msgChunks.join("") + "```");
    return msgs;
  }
  listQueue() {
    var text = "\n--- Queue: ---\n";
    if (this.data.current) text += "[x] " + this.getVidName(this.data.current, true) + "\n";
    this.data.queue.forEach((vid, i) => {
      text += "[" + i + "] " + this.getVidName(vid, true) + "\n";
    });
    if (this.data.queue.length == 0 && !this.data.current) text += "\n--- Empty ---\n\n";
    text += "--------------";
    let textArr = this.msgChunking(text);
    return textArr;
  }
  list() {
    let messages = this.listQueue();
    return [
      "Here's the queue: ",
      ...messages
    ]
  }
  loop(choice) {
    if (!["song", "queue"].includes(choice)) return "You have to specify what to loop. [song/queue]";
    switch (choice) {
      case "song":
        if (this.data.queueSong) {
          this.data.queueSong = false;
          return "Song loop deactivated";
        }
        this.data.queueSong = true;
        return "Song loop activated";
        break;
      case "queue":
        if (this.data.loop) {
          this.data.loop = false;
          return "Queue loop deactivated";
        }
        this.data.loop = true;
        return "Queue loop activated";
        break;
      default:
        return "Something went wrong";
        break;
    }
  }
  remove(index) {
    if (!index && index != 0) throw "You have to specify an index to remove out of the queue";
    if (!this.data.queue[index]) return "Invalid index.";
    let title = this.data.queue[index].title;
    this.data.queue.splice(index, 1);
    return "Successfully removed **" + title + "** from the queue.";
  }
  async leave() {
    if (!this.connection) return false;
    if (this.connection.state === Revoice.State.OFFLINE) return false;
    this.connection.state = Revoice.State.OFFLINE;
    this.leaving = true;
    this.connection.leave();
    this.voice.connections.delete(this.connection.channelId);
    /*await (() => {
      return new Promise((res) => {
        this.connection.once("leave", res)
      });
    })()*/
    this.data.current = null;
    this.data.queue = [];
    return true;
  }
  destroy() {
    return this.connection.destroy();
  }
  nowPlaying() {
    if (!this.data.current) return "There's nothing playing at the moment";
    let loopqueue = (this.data.loop) ? "**enabled**" : "disabled";
    let songloop = (this.data.queueSong) ? "**enabled**" : "disabled";
    return "Playing: **[" + this.data.current.title + "](" + this.data.current.url + ")** (" + this.data.current.duration.timestamp + ")" + "\n\nQueue loop: " + loopqueue + "\nSong loop: " + songloop;
  }

  join(channel) {
    return new Promise((res) => {
      this.voice.join(channel, 15).then(connection => {
        connection.once("join", res);
        this.connection = connection;
        this.connection.on("state", (state) => {
          //console.log(state);
          this.state = state;
          if (state == Revoice.State.OFFLINE && !this.leaving) {
            this.events.emit("autoleave");
            return;
          }
          if (state != Revoice.State.IDLE) return;
          this.playNext();
        });
      });
    });
  }
  play(query) {
    if (this.connection.state == Revoice.State.OFFLINE) {
      return "Please let me join first";
    }
    if (!this.connection.media) {
      let p = new MediaPlayer(false, this.port);
      this.player = p;
      this.connection.play(p);
    }

    const events = new EventEmitter();
    var res = false;
    const worker = new Worker('./worker.js', { workerData: { query: query, type: "command" } });
    worker.on("message", (data) => {
      data = JSON.parse(data);
      res = true;
      if (data) {
        switch (data.type) {
          case "list":
            let videos = data.data;
            videos.forEach((vid) => {
              this.addToQueue(vid);
            });
            if (!this.data.current) this.playNext();
            break;
          case "video":
            let vid = data.data;
            this.addToQueue(vid);
            if (!this.data.current) this.playNext();
            break;
          default:
            return events.emit("data", data.content);
            break;
        }
      }
    });
    worker.on("exit", (code) => {
      if (!res) console.log("Query process error: ", code);
      if (!res) events.emit("data", "There was either an error or no results were found.");
    });
    return events;
  }
}

module.exports = RevoltPlayer;
