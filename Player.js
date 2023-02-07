const EventEmitter = require("events");
const { Revoice, MediaPlayer } = require("revoice.js");
const { Worker } = require('worker_threads');
const ytdl = require('ytdl-core');
const Uploader = require("revolt-uploader");
const https = require('https');
const Spotify = require('spotifydl-core').default;
const scdl = require('soundcloud-downloader').default;
const { Readable } = require('stream');
const prism = require("prism-media");

class RevoltPlayer extends EventEmitter {
  constructor(token, opts) {
    super();

    this.voice = opts.voice || new Revoice(token);
    this.connection = {
      state: Revoice.State.OFFLINE
    }
    this.upload = new Uploader(opts.client, true);

    this.spotify = new Spotify(opts.spotify);
    this.spotifyConfig = opts.spotify;

    this.port = 3050 + (opts.portOffset || 0);
    this.updateHandler = (content, msg) => {
      msg.edit({ content: content });
    }

    this.LEAVE_TIMEOUT = opts.lTimeout || 15;

    this.YT_API_KEY = opts.ytKey;
    this.token = token;
    this.REVOLT_CHAR_LIMIT = 1950;
    this.resultLimit = 5;

    this.searches = new Map();
    this.volumeTransformer = new prism.VolumeTransformer({ type: "s16le", volume: 1 });

    this.data = {
      queue: [],
      current: null,
      loop: false,
      loopSong: false
    };

    return this;
  }
  setUpdateHandler(handler) {
    this.updateHandler = handler;
  }
  workerJob(jobId, data, onMessage=null, msg=null) {
    return new Promise((res, rej) => {
      const worker = new Worker('./worker.js', { workerData: { jobId, data } });
      worker.on("message", (data) => {
        data = JSON.parse(data);
        if (data.event == "error") {
          rej(data.data);
        } else if (data.event == "message" && (msg || onMessage)) {
          if (msg) this.updateHandler(data.data, msg);
          if (onMessage) onMessage(data.data);
        } else if (data.event == "finished") {
          res(data.data);
        }
      });
      worker.on("exit", (code) => { if (code == 0) rej(code)});
    });
  }
  guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
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
  addIdToQueue(id) {
    return new Promise((res, _rej) => {
      this.workerJob("search", id).then((data) => {
        this.data.queue.push(data);
        res(true);
      }).catch(res(false));
    });
  }
  addToQueue(data, top=false) {
    if (!top) return this.data.queue.push(data);
    return this.data.queue.unshift(data);
  }

  // music controls
  shuffle() {
    if (this.data.queue.length == 0) return "The is nothing to shuffle in the queue.";
    this.data.queue = this.shuffleArr(this.data.queue);
    return;
  }
  pause() {
    if (!this.player || !this.data.current) return `:negative_squared_cross_mark: There's nothing playing at the moment!`;
    this.player.pause();
    return;
  }
  resume() {
    if (!this.player || !this.data.current) return `:negative_squared_cross_mark: There's nothing playing at the moment!`;
    this.player.resume();
    return;
  }
  skip() {
    if (!this.player || !this.data.current) return `:negative_squared_cross_mark: There's nothing playing at the moment!`;
    this.player.stop();
    return;
  }
  clear() {
    this.data.queue.length = 0;
  }

  // utility commands
  getVidName(vid, code=false) {
    if (code) return vid.title + " (" + vid.duration.timestamp + ")" + ((vid.url) ? " - " + vid.url : "");
    return "[" + vid.title + " (" + vid.duration.timestamp + ")" + "]" + ((vid.url) ? "(" + vid.url + ")" : "");
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
    const intro = "Here's the queue: ";
    var text = intro + "\n--- Queue: ---\n";
    if (this.data.current) text += "[x] " + this.getVidName(this.data.current, true) + "\n";
    this.data.queue.forEach((vid, i) => {
      text += "[" + i + "] " + this.getVidName(vid, true) + "\n";
    });
    if (this.data.queue.length == 0 && !this.data.current) text += "\n--- Empty ---\n\n";
    text += "---- End -----";
    let textArr = this.msgChunking(text);
    textArr[0] = intro + "\n" + textArr[0];//"\n```" + textArr[0].substring(5 + intro.length);
    return textArr;
  }
  list() {
    let messages = this.listQueue();
    return [
      ...messages
    ]
  }
  loop(choice) {
    if (!["song", "queue"].includes(choice)) return "'" + choice + "' is not a valid option. Valid are: `song`, `queue`";
    let name = choice.charAt(0).toUpperCase() + choice.slice(1);

    var toggle = (varName, name) => {
      let variable = this.data[varName];
      this.data[varName] = 1 - variable; // toggle boolean state
      variable = this.data[varName];
      return (variable) ? name + " loop activated" : name + " loop deactivated";
    }
    return toggle((choice == "song") ? "loopSong" : "loop", name);
  }
  remove(index) {
    if (!index && index != 0) throw "Index can't be empty";
    if (!this.data.queue[index]) return "Index out of bounds";
    let title = this.data.queue[index].title;
    this.data.queue.splice(index, 1);
    return "Successfully removed **" + title + "** from the queue.";
  }
  async nowPlaying() {
    if (!this.data.current) return "There's nothing playing at the moment.";
    let loopqueue = (this.data.loop) ? "**enabled**" : "**disabled**";
    let songloop = (this.data.loopSong) ? "**enabled**" : "**disabled**";
    return { msg: "Playing: **[" + this.data.current.title + "](" + this.data.current.url + ")** (" + this.data.current.duration.timestamp + ")" + "\n\nQueue loop: " + loopqueue + "\nSong loop: " + songloop, image: await this.uploadThumbnail() };
  }
  uploadThumbnail() {
    return new Promise((res) => {
      if (!this.data.current) return res(null);
      https.get(this.data.current.thumbnail, async (response) => {
        res(await this.upload.upload(response, this.data.current.title));
      });
    });
  }
  getThumbnail() {
    return new Promise(async (res) => {
      if (!this.data.current) return res({ msg: "There's nothing playing at the moment.", image: null });
      res({ msg: `The thumbnail of the video [${this.data.current.title}](${this.data.current.url}): `, image: await this.uploadThumbnail() });
    });
  }
  setVolume(v) {
    const connection = this.voice.getVoiceConnection(this.connection.channelId);
    if (!connection.media) return "There's nothing playing at the moment...";
    this.connection.preferredVolume = v;
    connection.media.setVolume(v);
    return "Volume changed.";
  }
  announceSong(s) {
    this.emit("message", "Now playing [" + s.title + "](" + s.url + ") by [" + s.author.name + "](" + s.author.url + ")");
  }

  // functional core
  async playNext() {
    if (this.data.queue.length === 0 && !this.data.loopSong) { this.data.current = null; return false; }
    const current = this.data.current;
    const songData = (this.data.loopSong && current) ? current : this.data.queue.shift();
    if (current && this.data.loop && !this.data.loopSong) this.data.queue.push(current);

    this.data.current = songData;
    const connection = this.voice.getVoiceConnection(this.connection.channelId);
    const stream = (songData.type == "soundcloud") ?
      await scdl.download(songData.url)
      :
      ytdl("https://www.youtube.com/watch?v=" + songData.videoId, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1024 * 1024 * 10, // 10mb
        requestOptions: {
          headers: {
            "Cookie": "ID=" + new Date().getTime(),
            //"x-youtube-identity-token": this.YT_API_KEY
          }
        }
      }, { highWaterMark: 1048576 / 4 });
    connection.media.playStream(stream);
    if (this.connection.preferredVolume) connection.media.setVolume(this.connection.preferredVolume);
    this.announceSong(this.data.current);
  }
  leave() {
    if (!this.connection) return false;
    if (this.connection.state === Revoice.State.OFFLINE) return false;
    this.connection.state = Revoice.State.OFFLINE;
    this.leaving = true;
    this.connection.leave();
    this.voice.connections.delete(this.connection.channelId);
    this.data.current = null;
    this.data.queue = [];
    return true;
  }
  destroy() {
    return this.connection.destroy();
  }
  fetchResults(query, id) { // TODO: implement pagination of further results
    return new Promise(res => {
      let list = "Search results:\n\n";
      this.workerJob("searchResults", { query: query, resultCount: this.resultLimit }, () => {}).then((data) => {
        data.data.forEach((v, i) => {
          list += `${i + 1}. [${v.title}](${v.url}) - ${v.duration.timestamp}\n`;
        });
        list += "\nSend the number of the result you'd like to play here in this channel. Example: `2`\nTo cancel this process, just send an 'x'!";
        this.searches.set(id, data.data);
        res({ m: list, count: data.data.length });
      });
    });
  }
  playResult(id, result=0, next=false) {
    if (!this.searches.has(id)) return null;
    const res = this.searches.get(id)[result];

    let prep = this.preparePlay();
    if (prep) return prep;

    this.addToQueue(res, next);
    if (!this.data.current) this.playNext();
    return res;
  }
  join(channel) {
    return new Promise(res => {
      this.voice.join(channel, this.LEAVE_TIMEOUT).then(connection => {
        connection.once("join", res);
        this.connection = connection;
        this.connection.on("state", (state) => {
          this.state = state;
          if (state == Revoice.State.OFFLINE && !this.leaving) {
            this.emit("autoleave");
            return;
          }
          if (state == Revoice.State.IDLE) this.playNext();
        });
      });
    })
  }
  preparePlay() {
    if (this.connection.state == Revoice.State.OFFLINE) return "Please let me join first.";
    if (!this.connection.media) {
      let p = new MediaPlayer(false, this.port);
      this.player = p;
      this.connection.play(p);
    }
  }
  playFirst(query) {
    return this.play(query, true);
  }
  play(query, top=false) { // top: where to add the results in the queue (top/bottom)
    let prep = this.preparePlay();
    if (prep) return prep;

    const events = new EventEmitter();
    this.workerJob("generalQuery", { query: query, spotify: this.spotifyConfig }, (msg) => {
      events.emit("message", msg);
    }).then((data) => {
      if (data.type == "list") {
        data.data.forEach(vid => {
          this.addToQueue(vid, top);
        });
      } else if (data.type == "video") {
        this.addToQueue(data.data, top);
      } else {
        console.log("Unknown case: ", data.type, data);
      }
      if (!this.data.current) this.playNext();
    }).catch(reason => {
      console.log("reason", reason);
      reason = reason || "An error occured. Please contact the support if this happens reocurringly.";
      events.emit("message", reason);
    });
    return events;
  }
}

module.exports = RevoltPlayer;
