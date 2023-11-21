class SongItem extends HTMLElement {
  coverElem = null;
  artistElem = null;
  titleElem = null;
  durationElem = null;

  _cover = "/assets/icon.png";
  _artist = "Artist name";
  _title = "Song name";
  _duration = 0;
  _timestamp = "00:00";

  static get observedAttributes() {
    return ["cover", "artist", "title", "duration", "timestamp"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const c = document.createElement("div");
    c.style = "width: 100%; height: 4rem; padding: 0.3rem; display: flex; flex-direction: row; gap: 0.5rem; align-items: center; border-bottom: 1px solid rgb(19, 25, 39)";
    shadow.append(c);

    const cover = document.createElement("img");
    cover.alt = "Song cover";
    cover.src = this._cover;
    cover.style = "aspect-ratio: 1 / 1; height: 100%; border-radius: 5px; object-fit: cover";
    this.coverElem = cover;
    c.append(cover);

    const iCon = document.createElement("div");
    iCon.style = "flex-grow: 3; display: flex; flex-direction: column; align-items: flex-start; gap: 0.1rem";
    c.append(iCon);

    const title = document.createElement("span");
    title.style = "font-size: 1.1rem";
    title.innerText = "Song name";
    this.titleElem = title;
    iCon.append(title);

    const artist = document.createElement("span");
    artist.style = "font-size: 0.8rem";
    artist.innerText = "Artist name";
    this.artistElem = artist;
    iCon.append(artist);

    const duration = document.createElement("p");
    duration.style = "align-self: center";
    duration.innerText = "00:00";
    this.durElem = duration;
    c.append(duration);
  }

  get cover() { return this._cover; }
  set cover(url) {
    this._cover = url;
    this.coverElem.src = this._cover;
  }

  get artist() { return this._artist; }
  set artist(a) {
    this._artist = a;
    this.artistElem.innerText = a;
  }

  get title() { return this._title; }
  set title(t) {
    this._title = t;
    this.titleElem.innerText = t;
  }

  #formatTime(milliseconds) {
    return new Date(milliseconds).toISOString().slice(
      // if 1 hour passed, show the hour component,
      // if 1 hour hasn't passed, don't show the hour component
      milliseconds > 3600000 ? 11 : 14,
      19
    );
  }

  get duration() { return this._duration }
  set duration(ms) {
    this._duration = ms;
    this._timestamp = this.#formatTime(ms);
    this.durElem.innerText = this._timestamp;
  }

  get timestamp() { return this._timestamp; }
  set timestamp(t) {
    // covnert timestamp to seconds, then cast it to an int and then convert it to milliseconds
    this.duration = (+(t.split(':').reduce((acc,time) => (60 * acc) + +time))) * 1000;
  }
}

customElements.define("song-item", SongItem);

class Queue extends HTMLElement {
  songItems = [];

  songTemplate = null;
  listCon = null;
  cover = null;
  artist = null;
  title = null;

  _loop = false;
  _songloop = false;

  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "/css/Queue.css";
    shadow.append(styles);

    const c = document.createElement("div");
    c.style = "grid-row: 2; grid-column-start: 1; grid-column-end: 4; text-align: center";
    c.classList.add("queue-container");
    shadow.appendChild(c);

    const h = document.createElement("h1");
    h.style = "font-size: 1.5rem; font-weight: normal";
    h.innerText = "Queue";
    c.append(h, document.createElement("br"));

    const listCon = document.createElement("div");
    listCon.style = "width: 100%; display: flex; flex-direction: column;";
    listCon.classList.add("queue");
    this.listCon = listCon;
    c.append(listCon);
  }

  get loop() { return this._loop; }
  set loop(bool) { this._loop = !!bool; }

  get songLoop() { return this._songloop; }
  set songLoop(bool) { this._songloop = !!bool; }

  push(song) { // push a song into the queue
    const s = document.createElement("song-item");
    s.style = "width: 100%; height: 4rem; padding: 0.3rem; display: flex; flex-direction: row; gap: 0.5rem; align-items: center; border-bottom: 1px solid rgb(19, 25, 39)";
    this.listCon.append(s);

    s.title = song.title;
    s.artist = (!song.artists) ? song.author.name : song.artists.map(a => `${a.name}`).join(" & ");
    (song.duration.timestamp) ? s.timestamp = song.duration.timestamp : s.duration = song.duration;
    s.cover = song.thumbnail;

    this.songItems.push(s);
  }

  next() {
    if (this.songLoop) return;
    //const next = this.songItems.shift();

  }

  // TODO: other queue actions
}

customElements.define("remix-queue", Queue);
