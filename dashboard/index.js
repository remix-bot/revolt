const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require("path");
const session = require("express-session");
const mysql = require("mysql");

class Dashboard {
  port;
  remix;
  expiryTime = 1000 * 60 * 60 * 6; // 6 hours
  constructor(remix) {
    this.port = remix.config.webPort || 80;
    server.listen(this.port, () => {
      console.log("Listening on port " + this.port);
    });
    this.remix = remix;

    this.db = mysql.createConnection({
      ...this.remix.config.mysql
    });
    this.db.connect((err) => {
      if (err) console.error("Mysql Error: ", err);
      console.log("Database connected! ID: " + this.db.threadId);
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
    });
    app.get("/api/login/verify", async (req, res) => {
      const v = !!(await this.verifySession(req.session));
      if (v) req.session.verified = true;
      res.send(JSON.stringify(v));
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
  verifySession(session) {
    return new Promise(async res => {
      if (session.verified) return res(true);
      if (!session.user || !session.token) return res(false);
      this.db.query("SELECT token FROM logins WHERE user=" + this.db.escape(session.user) + " AND token=" + this.db.escape(session.token), (e, results) => {
        if (e) console.error("SELECT error: ", e);
        res(results.length > 0);
      });
    });
  }
 createLogin(id, session) {
    return new Promise((res) => {
      if (session.token) return session.token;
      const uid = this.guid();
      this.db.query(`INSERT INTO logins (user, token, verified, createdAt) VALUES (${this.db.escape(id)}, ${this.db.escape(uid)}, false, NOW())`, (error) => {
        this.db.query("DELETE FROM logins WHERE createdAt<" + this.db.escape(new Date(Date.now() - this.expiryTime)), (e) => {if (e) console.error("Cleanup mysql error: ", e)});
        if (error) {console.log("Insert statement error: ", error); res(false)}
        res(uid);
      });
    });
  }
  async login(uid, user) {
    return new Promise(res => {
      this.db.query("SELECT * FROM logins WHERE user=" + this.db.escape(user._id) + " AND token=" + this.db.escape(uid), (e, results) => {
        if (e) return res("Unexpected Error");
        if (results.length === 0) return res("Unknown user or wrong token");
        const login = results[0];
        if (login.token != uid) return res("Wrong Token"); // this shouldn't happpen -.-
        if (Date.now() - this.expiryTime > (new Date(login.createdAt)).getTime()) return res("Login token expired");
        this.db.query("UPDATE logins SET verified=true WHERE token=" + this.db.escape(uid), () => {
          res(true);
        });
      });
    });

  }
}

module.exports = Dashboard;
