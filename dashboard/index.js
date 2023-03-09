const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require("path");

class Dashboard {
  constructor() {
    server.listen(3000, () => {
      console.log("Listening on port 3000");
    });

    app.get("/:path", (req, res) => {
      const p = (req.params.path.includes(".")) ? req.params.path : req.params.path + "/index.html";
      res.sendFile(path.join(__dirname + "/static/" + p))
    });
    var options = {
      dotfiles: 'ignore',
      etag: false,
      extensions: ['htm', 'html'],
      index: false,
      maxAge: '1d',
      redirect: false,
      setHeaders: function (res, path, stat) {
        res.set('x-timestamp', Date.now())
      }
    }

    app.use(express.static('static', options))

    app.get("/", (_req, res) => {
      res.sendFile(path.join(__dirname + "/static/index.html"));
    });
  }
}

module.exports = Dashboard;
