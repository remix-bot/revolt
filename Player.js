const EventEmitter = require("events");
const { Revoice, MediaPlayer } = require("revoice.js");
const { Worker } = require('worker_threads');
const ytdl = require('ytdl-core');

class RevoltPlayer extends EventEmitter {
  constructor(token, opts) {
    super();

    this.voice = opts.voice || new Revoice(token);
    this.connection = {
      state: Revoice.State.OFFLINE
    }

    this.port = 3050 + (opts.portOffset || 0);
    this.updateHandler = (content, msg) => {
      msg.edit({ content: content });
    }

    this.LEAVE_TIMEOUT = opts.lTimeout || 15;

    this.YT_API_KEY = opts.ytKey;
    this.token = token;
    this.REVOLT_CHAR_LIMIT = 1950;

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
  addToQueue(data) {
    this.data.queue.push(data);
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
    this.data.queue = [];
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
  nowPlaying() {
    if (!this.data.current) return "There's nothing playing at the moment.";
    let loopqueue = (this.data.loop) ? "**enabled**" : "**disabled**";
    let songloop = (this.data.loopSong) ? "**enabled**" : "**disabled**";
    return "Playing: **[" + this.data.current.title + "](" + this.data.current.url + ")** (" + this.data.current.duration.timestamp + ")" + "\n\nQueue loop: " + loopqueue + "\nSong loop: " + songloop;
  }

  // functional core
  playNext() {
    if (this.data.queue.length === 0 && !this.data.loopSong) { this.data.current = null; return false; }
    const current = this.data.current;
    const songData = (this.data.loopSong && current) ? current : this.data.queue.shift();
    if (current && this.data.loop && !this.data.loopSong) this.data.queue.push(current);

    this.data.current = songData;
    const connection = this.voice.getVoiceConnection(this.connection.channelId);
    connection.media.playStream(ytdl("https://www.youtube.com/watch?v=" + songData.videoId, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1024 * 1024 * 10, // 10mb
      requestOptions: {
        headers: {
          "Cookie": "ID=" + new Date().getTime(),
          //"x-youtube-identity-token": this.YT_API_KEY
        }
      }
    }, { highWaterMark: 1048576 / 4 }));
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
  play(query) {
    if (this.connection.state == Revoice.State.OFFLINE) return "Please let me join first.";
    if (!this.connection.media) {
      let p = new MediaPlayer(false, this.port);
      this.player = p;
      this.connection.play(p);
    }

    const events = new EventEmitter();
    this.workerJob("generalQuery", query, (msg) => {
      events.emit("message", msg);
    }).then((data) => {
      if (data.type == "list") {
        data.data.forEach(vid => {
          this.addToQueue(vid);
        });
      } else if (data.type == "video") {
        this.addToQueue(data.data);
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
