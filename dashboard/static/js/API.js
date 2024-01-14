export default class API {
  url = "/api/";
  constructor() { // TODO: websocket

  }
  join(...paths) {
    return paths.map((part, i) => {
      if (i === 0) {
        return part.trim().replace(/[\/]*$/g, '')
      } else {
        return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
      }
    }).filter(x=>x.length).join('/');
  }

  async post(path, body) { // TODO: improve request handling
    return new Promise((res, rej) => {
      fetch(this.join(this.url, path), {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json"
        }
      }).then(async r => {
        if (!r.ok) return rej(JSON.parse(await r.text()))
        res(await r.json())
      }).catch(e => console.log(e));
    })
  }
  async get(path) {
    return new Promise((res, rej) => {
      fetch(this.join(this.url, path), {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }).then(async r => {
        if (!r.ok) return rej(JSON.parse(await r.text()));
        res(await r.json());
      }).catch(e => console.log(e));
    })
  }

  pause() { // TODO: unify pause/skip/resume flow
    return new Promise(res => {
      this.post("/dashboard/control", {
        action: "pause"
      }).then(d => {
        res(d.success);
      }).catch(e => {
        // error occured
        // notifications.error(e.message)
        res(false);
      });
    });
  }
  resume() {
    return new Promise(res => {
      this.post("/dashboard/control", {
        action: "resume"
      }).then(d => {
        res(d.success);
      }).catch(e => {
        // error occured
        // notifications.error(e.message)
        res(false);
      });
    });
  }
  skip() {
    return new Promise(res => {
      this.post("/dashboard/control", {
        action: "skip"
      }).then(d => {
        res(d.success);
      }).catch(e => {
        // error occured
        // notifications.error(e.message)
        res(false);
      });
    });
  }
  setVolume() {

  }
}
