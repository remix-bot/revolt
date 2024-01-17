import NotificationManager from "/js/Notifications.js";
import ColourUtil from "/js/ColourUtil.js";
import API from "/js/API.js";
import "/js/SearchInput.js";
import "/js/Queue.js";

class Player extends HTMLElement {
  static get observedAttributes() {
    return ["disabled"];
  }
  artist = null;
  song = null;
  img = null;
  controls = null;

  queue = null;

  _disabled = false;
  elapsedTime = 0;
  timeInterval = 0;
  timerRunning = false;
  _duration = 0;

  elapsedTimeElem = null;
  durationElem = null;
  volSlider = null;
  volIcon = null;

  currVol = 100;

  api = null;
  colour = new ColourUtil(); // TODO: implement colour changes

  constructor() {
    super();

    if (!window.remix) window.remix = { notifications: new NotificationManager() };
    if (!window.remix.notifications) window.remix.notifications = new NotificationManager();

    // TODO: switch to custom event emitter
    this.api = new API(); // initiate after notification manager initiated
    this.#setupEvents();

    this.songInfo = {
      duration: 0,
      elapsedTime: 0,
      artist: null,
      title: null,
      thumbnail: null
    };
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "/css/Player.css";
    shadow.appendChild(styles)

    const fa = document.createElement("link");
    fa.rel = "stylesheet";
    fa.href = "/assets/fontawesome/css/fontawesome.css";

    const faAll = document.createElement("link");
    faAll.rel = "stylesheet";
    faAll.href = "/assets/fontawesome/css/all.min.css";
    shadow.append(fa, faAll);

    const c = document.createElement("div"); // container div
    c.style = `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    row-gap: 1rem;
    grid-rows: 2;
    align-items: center;
    padding: 1.5rem;
    border-radius: 5px;
    background-color: rgb(31, 41, 55);
    /*border: 1px solid #282828;*/
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.4);
    color: #fff;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 1rem;`;
    c.classList.add("remix-player");
    shadow.appendChild(c);

    const imgCon = document.createElement("div");
    imgCon.style = "aspect-ratio: 1/1; margin-right: 2rem; grid-row: 1; grid-column: 1;";
    imgCon.classList.add("thumbnail");
    c.appendChild(imgCon);

    const img = document.createElement("img");
    img.id = "thumbnail";
    img.setAttribute("cbgrdc", "nochange");
    img.style = "border-radius: 5px; object-fit: cover; height: 100%; width: 100%;";
    img.src = "/assets/icon.png";
    img.alt = "Thumbnail of the current song";
    this.img = img;
    imgCon.append(img);

    const cCon = document.createElement("div"); // control container
    cCon.style = "display: flex; flex-direction: column; justify-content: center; height: 100%; flex-grow: 2; grid-row: 1; grid-column-start: 2; grid-column-end: 4; text-align: center; gap: 0.2rem";
    cCon.class = "player-info";
    c.append(cCon);

    const h1 = document.createElement("h1");
    h1.style = "font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;";
    h1.innerText = "Currently Playing";
    cCon.append(h1);

    const songName = document.createElement("p");
    songName.style = "font-size: 1rem; margin-bottom: 1rem;";
    cCon.append(songName);

    const song = document.createElement("span");
    this.song = song;
    song.id = "song";

    const artist = document.createElement("span");
    artist.id = "artist";
    this.artist = artist;
    songName.append(song, " - ", artist);

    const time = document.createElement("span");
    cCon.append(time);

    const elapsed = document.createElement("span");
    elapsed.id = "elapsedTime";
    elapsed.innerText = "00:00";
    this.elapsedTimeElem = elapsed;

    const duration = document.createElement("span");
    duration.id = "duration";
    duration.innerText = "00:00";
    this.durationElem = duration;
    time.append(elapsed, "/", duration);

    const controls = document.createElement("div");
    controls.style = "display: flex; flex-direction: row; justify-content: center; opacity: 0.5";
    this.controls = controls;
    cCon.append(controls);

    const playBtn = document.createElement("button");
    playBtn.classList.add("btn", "btn-play", "btn-pbt", "hidden"); // TODO: remove unnecessary classes
    playBtn.style = "margin-right: 0.5rem";
    playBtn.addEventListener("click", async () => {
      // TODO: click events
      const success = await this.api.resume();
      if (!success) return;

      pauseBtn.classList.remove("hidden");
      playBtn.classList.add("hidden");
    });
    playBtn.setAttribute("action", "resume");
    playBtn.disabled = true;
    playBtn.append(this.#createFaI("fa-solid fa-play", "color: #e9196c;"));
    controls.append(playBtn);

    const pauseBtn = document.createElement("button");
    pauseBtn.classList.add("btn", "btn-pause", "btn-pbt");
    pauseBtn.addEventListener("click", async () => {
      // TODO: click events
      const success = await this.api.pause();
      if (!success) return;

      playBtn.classList.remove("hidden");
      pauseBtn.classList.add("hidden");
    });
    pauseBtn.setAttribute("action", "pause");
    pauseBtn.disabled = true;
    pauseBtn.append(this.#createFaI("fa-solid fa-pause", "color: #e9196c; margin-right: 0.5rem;"));
    controls.append(pauseBtn);

    const skipBtn = document.createElement("button");
    skipBtn.classList.add("btn", "btn-skip", "btn-pbt");
    skipBtn.setAttribute("action", "skip");
    skipBtn.addEventListener("click", async () => {
      // TODO: pushAction(this);
      const success = await this.api.skip();
      if (!success) return;
    });
    skipBtn.disabled = true;
    skipBtn.append(this.#createFaI("fa-solid fa-forward", "color: #e9196c"));
    controls.append(skipBtn);

    const slContainer = document.createElement("div");
    slContainer.classList.add("slidecontainer");
    slContainer.style = "margin-left: 0.5rem; display: flex; flex-direction: row; align-items: center; gap: 0.2rem";
    slContainer.title = "100%";
    controls.append(slContainer);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.style = "accent-color: #e9196c; background: #e9196c";
    slider.classList.add("slider");
    slider.id = "volumeSlider";
    slider.value = 100;
    slider.min = 0;
    slider.max = 100;
    this.volSlider = slider;
    this.currVol = +slider.value;
    slider.addEventListener("mouseup", async (e) => { // post volume to server
      this.updateSlider();
      this.updateVolIcon();
      const d = await this.api.setVolume(+e.target.value);
      const volume = this.currVol;
      if (d) return this.currVol = +e.target.value;

      // reset volume slider on error
      this.setVolD(volume);
    });
    // for reference check player.ejs
    slider.addEventListener("oninput", (e) => { // update slider range according to changes
      this.updateSlider(e);
      this.updateVolIcon(value);
    });
    slContainer.append(slider);
    const vI = this.#createFaI("fa-solid fa-volume-high", "float:left;color: #e9196c");
    vI.id = "volumeIcon";
    this.volIcon = vI;
    slContainer.append(vI);

    const search = document.createElement("search-input");
    search.addEventListener("result", (e) => console.log(e.detail))
    // TODO: implement full window search
    cCon.append(search);

    const queue = document.createElement("remix-queue");
    queue.style = "grid-row: 2; grid-column-start: 1; grid-column-end: 4";
    this.queue = queue;
    c.append(queue);

    // TODO: maximising/minimising player (together with lazy loading)
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name !== "disabled") return;
    if (oldVal == newVal) return;
    if (newVal == "true") return this.disabled = true; // run setter
    if (newVal == "false") return this.disabled = false;
  }

  #setupEvents() { // TODO: implement events
    const socket = this.api.socket;

    socket.on("info", (info) => {
      console.log(info);
      if (info.currData) {
        this.setVolD(info.currData.volume * 100);
        //updatePlaybackStatus(info.currData);
        //renderQueue(info.currData.queue);
      }
      //if (info.channel) updateCDisplay(info);
      if (Object.keys(info.currSong || {}).length > 1) {
        //update(info.currSong);
        if (info.currSong.elapsedTime > 0) this.startTimer(info.currSong.elapsedTime);
      }
      if (info.channel) this.disabled = false;
    });
    socket.on("joined", (data) => {
      console.log(data);
      this.disabled = false;
      //renderQueue(data.currData.queue);
      this.setVolD(data.currData.volume * 100);
      //updateCDisplay(data)
      //if (data.currSong) update(data.currSong);
      //updatePlaybackStatus(data.currData);
    });
    socket.on("resume", (d) => {
      this.startTimer(d.elapsedTime);
      //updatePlaybackStatus({ paused: false });
    });
    socket.on("pause", (d) => {
      this.stopTimer(d.elapsedTime);
      //updatePlaybackStatus({ paused: true })
    });
    socket.on("userjoin", (user) => {
      console.log("join", user);
    })
    socket.on("userleave", (user) => {
      console.log("leave", user);
    });
    socket.on("left", () => {
      this.stopTimer(0);
      this.resetTimeDisplay();
      this.reset();
      // TODO: implement the following line outside of the player class:
      //updateCDisplay({ channel: { name: "-" }, server: { name: "-" } })
    });
    socket.on("startplay", (vid) => {
      this.stopTimer(0);
      this.resetTimeDisplay();
      //update(vid)
    });
    socket.on("streamStartPlay", () => this.startTimer(0))
    socket.on("stopplay", () => {
      this.stopTimer(0);
      this.resetTimeDisplay();
      this.reset();
    });
    socket.on("volume", (v) => this.setVolD(v * 100));
    socket.on("queue", (data) => {
      switch (data.type) {
        case "add": // something is added to the queue
          const video = data.data.data;
          this.queue.push(video, !data.data.append);
        break;
        case "remove": // something is removed from the queue
          const index = data.data.index;
          this.queue.remove(index);
        break;
        case "update": // queue has changed due to a new song playing
          this.queue.next();
        break;
        case "shuffle":
          const newArr = data.data;
          this.queue.rearrange(newArr.map(s => s.videoId));
        break;
      }
    });
  }

  formatTime(milliseconds) {
    return new Date(milliseconds).toISOString().slice(
      // if 1 hour passed, show the hour component,
      // if 1 hour hasn't passed, don't show the hour component
      milliseconds > 3600000 ? 11 : 14,
      19
    );
  }

  isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' &&
      isFinite(value) &&
      Math.floor(value) === value;
  };

  updateSlider() {
    this.volSlider.style.background = `linear-gradient(to right, #e9196c ${this.volSlider.value}%, rgb(19, 25, 39) ${this.volSlider.value}%)`;
    const value = Math.round(this.volSlider.value);
    this.volSlider.parentElement.title = value + "%";
  }
  setVolD(vol) {
    this.currVol = vol;
    this.volSlider.value = vol;
    this.updateSlider();
    this.updateVolIcon(vol);
  }
  updateVolIcon(value) {
    const volumeIcon = this.volIcon;
    if (value < 50) {
      if (volumeIcon.classList.contains("fa-volume-low")) return;
      volumeIcon.classList.remove("fa-volume-high");
      volumeIcon.classList.add("fa-volume-low");
    } else {
      if (volumeIcon.classList.contains("fa-volume-high")) return;
      volumeIcon.classList.add("fa-volume-high");
      volumeIcon.classList.remove("fa-volume-low");
    }
  }

  async startTimer(startVal) {
    if (startVal || startVal === 0) this.elapsedTime = startVal;
    this.elapsedTimeElem.innerText = this.formatTime(this.elapsedTime);
    this.timerRunning = true;

    const countUp = () => {
      this.elapsedTime += 1000;
      this.elapsedTimeElem.innerText = this.formatTime(this.elapsedTime);
    }

    if (!this.isInteger(this.elapsedTime / 1000)) {
      const diff = ((Math.floor(this.elapsedTime / 1000) + 1) - (this.elapsedTime / 1000)) * 1000;
      this.elapsedTime = this.elapsedTime + diff;
      await (new Promise(res => setTimeout(res, diff)));
      countUp();
    }
    this.timeInterval = setInterval(countUp, 1000);
  }
  stopTimer(time) {
    if (this.timeInterval) clearInterval(this.timeInterval);
    if (time && time !== 0) this.elapsedTime = time;
    this.timerRunning = false;
    this.elapsedTimeElem.innerText = this.formatTime(this.elapsedTime);
  }
  resetTimeDisplay() {
    this.time = 0;
    this.duration = 0;
  }

  get time() { return this.elapsedTime; };
  set time(num) {
    if (this.timerRunning) {
      this.stopTimer();
      return this.startTimer(num);
    }
    this.elapsedTime = num;
    this.elapsedTimeElem.innerText = this.formatTime(num);
  }
  get duration() { return this._duration; };
  set duration(num) {
    this._duration = num;
    this.durationElem.innerText = this.formatTime(num);
  }

  reset() {
    this.disabled = true;
    // TODO: somehow implement the following line:
    // document.body.style.backgroundColor = "rgb(19, 25, 39)";
    this.img.src = "/assets/icon.png";
    this.img.setAttribute("cbgrdc", "nochange") // TODO: remove once the actual system is in place
    this.artist.innerText = "";
    this.song.innerText = "";
    this.queue.clear();
  }

  get disabled() {
    return this._disabled;
  }
  set disabled(bool) {
    bool = !!bool;
    this._disabled = bool;
    if (bool) return this.#disable();
    return this.#enable();
  }

  #disable() {
    this.img.src = "/assets/icon.png";
    this.img.setAttribute("cbgrdc", "nochange"); // TODO: remove once the other logic is done
    this.artist.innerText = "";
    this.song.innerText = "";

    // TODO: reset queue
    const btns = this.controls.children;
    this.controls.style.opacity = 0.5;
    for (let i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
    }
  }
  #enable() {
    const btns = this.controls.children;
    this.controls.style.opacity = 1;
    for (let i = 0; i < btns.length; i++) {
      btns[i].disabled = false;
    }
  }

  #createFaI(classNames, style) {
    const i = document.createElement("i");
    i.classList.add(...classNames.split(" "));
    i.style = style;
    return i;
  }
}

customElements.define("remix-player", Player);
