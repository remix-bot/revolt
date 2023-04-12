const express = require('express');
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const { Server } = require("socket.io");

class Dashboard {
  port;
  remix;
  expiryTime = 1000 * 60 * 60 * 6; // 6 hours
  observedPlayers = new Map();
  constructor(remix) {
    const http = require('http' + ((remix.config.ssl.useSSL) ? "s" : ""));
    const app = express();
    var server;
    if (remix.config.ssl.useSSL) {
      server = http.createServer({
        key: fs.readFileSync(remix.config.ssl.private),
        cert: fs.readFileSync(remix.config.ssl.cert)
      }, app);
    } else {
      server = http.createServer(app);
    }
    const io = new Server(server);
    io.on("connection", (socket) => this.socketHandler(socket));

    if (remix.config.ssl.useSSL) {
      const httpServer = express();
      httpServer.get("*", function(req, res) {
        res.redirect('https://' + req.headers.host + req.url);
      });

      httpServer.listen(remix.config.ssl.httpPort);
    }

    this.port = remix.config.webPort || 80;
    server.listen(this.port, () => {
      console.log("Listening on port " + this.port);
    });
    this.remix = remix;

    this.db = mysql.createPool({
      connectionLimit : 15,
      ...this.remix.config.mysql
    });

    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.static(path.join(__dirname, "/static")));
    app.use(cookieParser());
    app.use(session({
      secret: remix.config.sessionSecret || this.guid(),
      resave: false,
      secure: !!remix.config.ssl.useSSL,
      saveUninitialized: false
    }));

    app.set("view engine", "ejs");
    app.set("views", [path.join(__dirname, "views")]);
    app.get("/", (_req, res) => {
      // TODO: implement ejs system (maybe)
      res.render("index.ejs");
    });
    app.get("/login", async (req, res) => {
      if (await this.verifySession(req.session, req.cookies)) return res.redirect("/dashboard");
      const opts = (!req.session.verified) ? { id: req.session.tId, token: req.session.token} : {};
      opts.prefix = remix.config.prefix;
      res.render("login/index.ejs", opts);
    });

    app.get("/commands", (_req, res) => res.render("commands/index.ejs"))

    app.post("/api/login", async (req, res) => {
      const user = req.body.userId;
      const r = await this.createLogin(user, req);
      req.session.user = user;
      req.session.token = r.token;
      req.session.tId = r.id;
      res.send(JSON.stringify({ id: r.id, token: r.token }));
    });
    app.post("/api/login/verify", async (req, res) => {
      const v = await this.verifySession(req.session, req.cookies, req);
      if (v && req.body.ksi) {
        const r = await this.createKsiSession(req.session.user);
        res.cookie("ksiId", r.id, { maxAge: 1000 * 60 * 60 * 24 * 62 });
        res.cookie("ksiToken", r.token, { maxAge: 1000 * 60 * 60 * 24 * 62 });
      }
      if (v) req.session.verified = true;
      res.send(JSON.stringify(v));
    });

    app.get("/logout", async (req, res) => {
      if (req.session.tId) {
        try {
          await this.query("DELETE FROM logins WHERE id=" + this.db.escape(req.session.tId) + " AND user=" + this.db.escape(req.session.user));
        } catch(e) {
          console.log("delete failed", e);
        }
      }
      req.session.user = null;
      req.session.tId = null;
      req.session.token = null;
      req.session.verified = false;
      if (req.cookies.ksiId) {
        await this.query("DELETE FROM ksiTokens WHERE id=" + this.db.escape(req.cookies.ksiId));
        res.cookie("ksiId", null, { expires: new Date(0) })
        res.cookie("ksiToken", null, { expires: new Date(0) })
      }
      res.send("Logged out. <a href='/'>Home</a>");
    });

    app.get("/api/imageProxy", (req, res) => {
      const { URL } = require("url");
      var url = new URL(req.query.url);
      var externalReq = http.request({
        hostname: url.hostname,
        path: url.pathname + url.search,
      }, function(externalRes) {
        externalRes.pipe(res);
      });
      externalReq.end();
    });

    const secured = new express.Router();
    secured.use(async (req, res, next) => {
      if (!(await this.verifySession(req.session, req.cookies))) return res.status(403).send("Unauthorized. <a href='/login'>Log in</a>");
      req.data = {
        user: remix.client.users.get(req.session.user),
      }
      next();
    });
    app.use(secured);

    secured.get("/dashboard", (req, res) => {
      res.render("dashboard/index.ejs", req.data);
    });
    secured.post("/api/dashboard/control", (req, res) => {
      const d = this.getUserData(req.data.user._id);
      if (["pause", "skip", "resume"].includes(req.body.action) && !d.voice) return res.status(422).send({ message: "Not in a voice channel." });
      switch (req.body.action) {
        case "pause":
          res.status(200).send({ message: d.player.pause() || "Successfully paused"});
          break;
        case "resume":
          res.status(200).send({ message: d.player.resume() || "Successfully resumed"});
          break;
        default:
          res.status(400).send({ message: "Invalid aciton" });
          break;
      }
    });
  }
  getUserData(id) {
    const connection = (this.remix.revoice.getUser(id) || {}).connection;
    return {
      voice: connection,
      player: (connection) ? this.remix.playerMap.get(connection.channelId) : null
    }
  }
  socketHandler(socket) {
    const currInfo = (channel) => {
      if (!channel) return { channel: undefined };
      return {
        channel: {
          name: channel.name,
          icon: (channel.icon) ? `https://autumn.revolt.chat/icon/${channel.icon._id}` : null,
        },
        server: {
          name: channel.server.name,
          icon: (channel.server.icon) ? `https://autumn.revolt.chat/icon/${channel.server.icon._id}` : null,
        }
      }
    }
    const getSongData = (song, player) => {
      if (!song) return;
      return {
        videoId: song.videoId,
        title: song.title,
        url: song.url,
        description: song.description,
        thumbnail: song.thumbnail,
        duration: player.getDuration(song.duration),
        author: song.author
      }
    };
    const subscribePlayer = (player, socket) => {
      let startPlayHandler = song => {
        socket.emit("startplay", getSongData(song, player));
      }
      player.on("startplay", startPlayHandler);
      socket.on("disconnect", () => {
        player.removeListener("startplay", startPlayHandler);
      });
    }
    socket.on("info", (uid) => {
      const d = this.getUserData(uid);
      const con = d.voice || {};
      socket.emit("info", {
        connected: !!d.voice,
        ...currInfo(this.remix.client.channels.get(con.channelId)),
        currSong: (!!d.voice) ? getSongData(d.player.data.current, d.player) : null
      });
      if (!!d.voice) subscribePlayer(d.player, socket);
      const oid = this.remix.observeUserVoice(uid, (event, ...data) => {
        switch (event) {
          case "joined":
            let player = data[0];
            let channel = this.remix.client.channels.get(data[0].connection.channelId);
            socket.emit("joined", currInfo(channel));

            subscribePlayer(player, socket);
            break;
          case "left":
            socket.emit("left");
            break;
        }
      });
      socket.on("disconnect", () => {this.remix.unobserveUserVoice(oid);});
    });
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
  verifySession(session, cookies) {
    return new Promise(async res => {
      if (session.verified) return res(true);
      if (!session.user || !session.token) {
        if (cookies.ksiId) {
          return this.db.query("SELECT * FROM ksiTokens WHERE id=" + this.db.escape(cookies.ksiId), async (error, results) => {
            if (error) {console.error("SELECT error; ksi: ", error); return res(false)}
            if (results.length == 0) return res(false);
            if (!(await this.compareHash(cookies.ksiToken, results[0].token))) return res(false);
            session.user = results[0].user;
            session.verified = true;
            res(true);
          });
        }
        return res(false)
      };

      this.db.query("SELECT * FROM logins WHERE user=" + this.db.escape(session.user) + " AND id=" + this.db.escape(session.tId), async (e, results) => {
        if (e) {console.error("SELECT error: ", e); return res(false);}
        if (results.length == 0) return res(false);
        if (!(await this.compareHash(session.token, results[0].token))) res(false);
        session.verified = true;
        session.user = results[0].user;
        res(true);
      });
    });
  }
  createKsiSession(id) {
    return new Promise(async (res) => {
      const kId = this.guid();
      const kToken = await this.randToken();
      this.db.query(`INSERT INTO ksiTokens (user, id, token, createdAt) VALUES (${this.db.escape(id)}, ${this.db.escape(kId)}, ${this.db.escape(await this.hash(kToken))}, NOW())`, (error) => {
        if (error) console.error("KSI error: ", error);
        res({ token: kToken, id: kId });
      });
    });
  }
  createLogin(id, req, verified=false) {
    return new Promise(async (res) => {
      if (req.session.token && req.session.user == id) return res({ id: req.session.tId, token: req.session.token, kId: req.cookies.ksi, kToken: req.cookies.ksiToken });
      const uid = this.guid();
      const token = await this.randToken();
      this.db.query(`INSERT INTO logins (user, id, token, verified, createdAt) VALUES (${this.db.escape(id)}, ${this.db.escape(uid)}, ${this.db.escape(await this.hash(token))}, ${verified}, NOW())`, (error) => {
        this.db.query("DELETE FROM logins WHERE createdAt<" + this.db.escape(new Date(Date.now() - this.expiryTime)), (e) => {if (e) console.error("Cleanup mysql error: ", e)});
        if (error) {console.log("Insert statement error: ", error); res(false)}
        res({ token: token, id: uid });
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
