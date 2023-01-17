const fs = require("fs");

class ServerSettings {
  id;
  manager;
  data = {};

  constructor(id, mgr) {
    this.id = id;
    this.manager = mgr;

    this.loadDefaults();

    return this;
  }
  set(key, value) {
    this.data[key] = value;
    this.manager.update(this, key);
  }
  get(key) {
    return this.data[key];
  }
  getAll() {
    return this.data;
  }

  loadDefaults() {
    for (let key in this.manager.defaults) {
      this.data[key] = this.manager.defaults[key];
    }
  }
  deserialize(json) {
    for (let k in json) {
      if (k == "id") continue;
      this.data[k] = json[k];
    }
  }
  checkDefaults(d) {
    for (key in d) {
      if (!this.data[key]) this.data[key] = d[key];
    }
  }
  get serializationData() {
    return {
      ...this.data,
      id: this.id
    }
  }
  serialize() {
    return JSON.stringify(this.serializationData);
  }
  serializeObject() {
    return this.serializationData;
  }
}

class SettingsManager {
  guilds = new Map();
  storagePath = "./storage/settings.json";
  defaults = {}

  constructor(storagePath=null) {
    if (storagePath) this.storagePath = storagePath;

    this.load();

    return this;
  }
  loadDefaults(filePath) {
    return new Promise(res => {
      fs.readFile(filePath, (d) => {
        this.defaults = JSON.parse(d);
        res(this.defaults);
      });
    });
  }
  loadDefaultsSync(filePath) {
    const d = fs.readFileSync(filePath, "utf8");
    this.defaults = JSON.parse(d);
  }
  load() {
    if (!fs.existsSync(this.storagePath)) {
      const data = {
        servers: []
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data));
    }
    let json = JSON.parse(fs.readFileSync(this.storagePath, "utf8"));
    json.servers.forEach((s) => {
      let server = new ServerSettings(s.id, this);
      server.deserialize(s);
      server.checkDefaults(this.defaults);
      this.guilds.set(s.id, server);
    });
  }
  save() {
    let s = [];
    this.guilds.forEach((val, _k) => {
      s.push(val.serialize());
    });
    const d = {
      servers: s
    }
    fs.writeFileSync(this.storagePath, JSON.stringify(d));
  }
  saveAsync() {
    return new Promise((res) => {
      let s = [];
      this.guilds.forEach((val, _k) => {
        s.push(val.serializeObject());
      });
      const d = {
        servers: s
      }
      fs.writeFile(this.storagePath, JSON.stringify(d), () => {
        res();
      });
    });
  }
  update(server, key) {
    if (!this.guilds.has(server.id)) {
      this.guilds.set(server.id, server);
    }
    const s = this.guilds.get(server.id);
    s[key] = server[key];
  }
  isOption(key) {
    return key in this.defaults;
  }

  getServer(id) {
    return (!this.guilds.has(id)) ? new ServerSettings(id, this) : this.guilds.get(id);
  }
}

module.exports = { SettingsManager, ServerSettings };
