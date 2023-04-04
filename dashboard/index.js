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
        this.db.set("login", { tokens: {}, verified: {} })
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
      req.session.user = user;
      const id = await this.createLogin(user);
      res.send(JSON.stringify(id));
    });
    app.get("/api/login/verify", async (req, res) => {
      res.send(JSON.stringify(!!(await this.verifySession(req.session.user))))
    });

    app.get("/dashboard", async (req, res) => {
      if (!(await this.verifySession(req.session.user))) return res.status(403).send("Unauthorized");
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
  async verifySession(user) {
    if (!user) return false;
    return await this.db.has("login.verified." + user);
  }
  async createLogin(id) {
    if (await this.db.has("login.tokens." + id)) return (await this.db.get("login.tokens." + id)).id;
    const uid = this.guid();
    const login = { user: id, id: uid, time: Date.now(), verified: false };
    this.db.set("login.tokens." + id, login);
    return uid;
  }
  async login(uid, user) {
    const login = await this.db.get("login.tokens." + user._id);
    if (!login) return "Unknown user or invalid token!";
    if (Date.now() - 1000 * 60 * 60 * 6 > login.time) return "Login Expired";

    login.verified = true;
    await this.db.update("login.tokens." + user._id, login);
    await this.db.set("login.verified." + user._id, { verified: true });

    return true;
  }
}

module.exports = Dashboard;
