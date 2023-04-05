const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require("path");
const session = require("express-session");

const Josh = require('@joshdb/core');
const JoshJSON = require('@joshdb/json');

class Dashboard {
  port;
  remix;
  constructor(remix) {
    this.port = remix.config.webPort || 80;
    server.listen(this.port, () => {
      console.log("Listening on port " + this.port);
    });
    this.remix = remix;

    this.db = new Josh({
      name: 'remix',
      provider: JoshJSON,
      providerOptions: {
        dataDir: path.join(__dirname, "../storage/data")
      },
    });
    this.db.defer.then(async () => {
      console.log("Database connected. " + (await this.db.size) + " rows loaded.");
      if (!(await this.db.has("login.tokens"))) {
        this.db.set("login", { tokens: {} })
      }
    });

    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.static(path.join(__dirname, "/static")));
    app.use(session({
      secret: this.guid(),
      resave: false,
      saveUninitialized: true
    }));

    app.post("/api/login", async (req, res) => {
      const user = req.body.userId;
      const id = await this.createLogin(user, req.session);
      req.session.user = user;
      req.session.token = id;
      res.send(JSON.stringify(id));
      // TODO: security risk!
    });
    app.get("/api/login/verify", async (req, res) => {
      res.send(JSON.stringify(!!(await this.verifySession(req.session))))
    });

    app.get("/dashboard", async (req, res) => {
      if (!(await this.verifySession(req.session))) return res.status(403).send("Unauthorized");
      res.sendFile(path.join(__dirname, "/dynamic/dashboard/index.html"));
    });
    app.get("/dashboard/style.css", (_req, res) => res.sendFile(path.join(__dirname, "/dynamic/dashboard/style.css")))
    app.get("/dashboard/index.js", (_req, res) => res.sendFile(path.join(__dirname, "/dynamic/dashboard/index.js")))
  }
  guid() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  }
  async verifySession(session) {
    if (!session.user || !session.token) return false;
    const login = await this.db.get("login.tokens." + session.user);
    if (!login) return false;
    return login.verified.some(t => t.id == session.token);
  }
  async createLogin(id, session) {
    if (session.token) return session.token;
    const existing = await this.db.get("login.tokens." + id);
    if (!existing) await this.db.set("login.tokens." + id, { user: id, tokens: [], verified: [] });
    const uid = this.guid();
    const token = { id: uid, time: Date.now() };
    this.db.push("login.tokens." + id + ".tokens", token);
    return uid;
  }
  async login(uid, user) {
    const login = await this.db.get("login.tokens." + user._id);
    if (!login) return "Unknown user or invalid token!";
    const idx = login.tokens.findIndex(t => t.id == uid);
    if (idx == -1) return "Wrong Token";
    if (Date.now() - 1000 * 60 * 60 * 6 > login.tokens[idx].time) return "Login Expired";

    const token = login.tokens.splice(idx, 1);
    login.verified.push(token[0]);
    await this.db.update("login.tokens." + user._id, login);

    return true;
  }
}

module.exports = Dashboard;
