const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require("path");

class Dashboard {
  port;
  constructor(client) {
    this.port = client.config.webPort || 3000;
    server.listen(this.port, () => {
      console.log("Listening on port " + this.port);
    });

    app.use(express.static(path.join(__dirname + "/static")))
  }
}

module.exports = Dashboard;
