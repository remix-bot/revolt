const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

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

    const reconnect = () => {
      this.db = mysql.createConnection({
        ...this.remix.config.mysql
      });
      this.db.connect((err) => {
        if (err) {
          console.error("Mysql Error: ", err);
          if (err.code == "PROTOCOL_CONNECTION_LOST") {
            console.error("Connection to database lost. Attempting reconnect in 4 seconds...");
            return setTimeout(() => {console.log("Connecting..."); reconnect()}, 4000);
          }
        }
        console.log("Database connected! ID: " + this.db.threadId);
      });
    }
    reconnect();

    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.static(path.join(__dirname, "/static")));
    app.use(cookieParser());
    app.use(session({
      secret: this.guid(),
      resave: false,
      saveUninitialized: true
    }));

    app.post("/api/login", async (req, res) => {
      const user = req.body.userId;
      const ksi = req.body.ksi;
      const r = await this.createLogin(user, req, ksi);
      req.session.user = user;
      req.session.token = r.token;
      req.session.tId = r.id;
      if (r.kId) {
        res.cookie("ksiId", r.kId, { maxAge: 1000 * 60 * 60 * 24 * 62 })
        res.cookie("ksiToken", r.kToken, { maxAge: 1000 * 60 * 60 * 24 * 62 })
      }
      res.send(JSON.stringify({ id: r.id, token: r.token, ksi: !!ksi }));
    });
    app.get("/api/login/verify", async (req, res) => {
      const v = await this.verifySession(req.session, req.cookies, req);
      if (v) req.session.verified = true;
      res.send(JSON.stringify(v));
    });

    app.get("/dashboard", async (req, res) => {
      console.log("dash");
      if (!(await this.verifySession(req.session, req.cookies, req))) return res.status(403).send("Unauthorized");
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
  randToken() {
    return new Promise(res => {
      require('crypto').randomBytes(16, function(_err, buffer) {
        res(buffer.toString('hex'));
      });
    })
  }
  verifySession(session, cookies, req) {
    return new Promise(async res => {
      if (session.verified) return res(true);
      if (!session.user || !session.token) {
        if (cookies.ksiId) {
          return this.db.query("SELECT * FROM ksiTokens WHERE id=" + this.db.escape(cookies.ksiId), async (error, results) => {
            if (error) console.error("SELECT error; ksi: ", error);
            if (results.length == 0) return res(false);
            // TODO: make ksi session only valid if regular session verified
            if (!(await this.compareHash(cookies.ksiToken, results[0].token))) return res(false);
            //const r = this.createLogin(results[0].user, req, false, true);
            //session.user = results[0].user;
            //session.token = r.token;
            //session.tId = r.id;
            session.verified = true;
            res(true);
          });
        }
        return res(false)
      };

      this.db.query("SELECT token FROM logins WHERE user=" + this.db.escape(session.user) + " AND id=" + this.db.escape(session.tId), async (e, results) => {
        if (e) console.error("SELECT error: ", e);
        if (results.length == 0) return res(false);
        return res(await this.compareHash(session.token, results[0].token));
      });
    });
  }
 createLogin(id, req, ksi=false, verified=false) {
    return new Promise(async (res) => {
      if (req.session.token && req.session.user == id) return res({ id: req.session.tId, token: req.session.token, kId: req.cookies.ksi, kToken: req.cookies.ksiToken });
      var kId = null, kToken = null;
      if (ksi) {
        kId = this.guid();
        kToken = await this.randToken();
        this.db.query(`INSERT INTO ksiTokens (user, id, token, createdAt) VALUES (${this.db.escape(id)}, ${this.db.escape(kId)}, ${this.db.escape(await this.hash(kToken))}, NOW())`, (error) => {
          if (error) console.error("KSI error: ", error);
        });
      }
      const uid = this.guid();
      const token = await this.randToken();
      this.db.query(`INSERT INTO logins (user, id, token, verified, createdAt) VALUES (${this.db.escape(id)}, ${this.db.escape(uid)}, ${this.db.escape(await this.hash(token))}, ${verified}, NOW())`, (error) => {
        this.db.query("DELETE FROM logins WHERE createdAt<" + this.db.escape(new Date(Date.now() - this.expiryTime)), (e) => {if (e) console.error("Cleanup mysql error: ", e)});
        if (error) {console.log("Insert statement error: ", error); res(false)}
        res({ token: token, id: uid, kId, kToken });
      });
    });
  }
  async login(uid, user) {
    return new Promise(res => {
      uid = uid.split(";");
      const id = uid[0];
      const token = uid[1];
      this.db.query("SELECT * FROM logins WHERE user=" + this.db.escape(user._id) + " AND id=" + this.db.escape(id), async (e, results) => {
        if (e) { console.error("SELECT error; login: ", e); return res("Unexpected Error"); }
        if (results.length === 0) return res("Unknown user or wrong token");
        const login = results[0];
        if (!(await this.compareHash(token, login.token))) return res("Wrong Token"); // this shouldn't happpen -.-
        if (Date.now() - this.expiryTime > (new Date(login.createdAt)).getTime()) return res("Login token expired");
        this.db.query("UPDATE logins SET verified=true WHERE id=" + this.db.escape(id), () => {
          res(true);
        });
      });
    });
  }
  query(query) {
    return new Promise(res => {
      this.db.query(query, (error, results, fields) => { res({ error, results, fields })});
    });
  }
  hash(plain) {
    return new Promise((res, rej) => {
      bcrypt.hash(plain, 10, function(err, hash) {
        if (err) return rej(err);
        res(hash);
      });
    });
  }
  compareHash(plain, hash) {
    return new Promise((res, rej) => {
      bcrypt.compare(plain, hash, function(err, result) {
        if (err) return rej(err);
        res(result);
      });
    });
  }
}

module.exports = Dashboard;
