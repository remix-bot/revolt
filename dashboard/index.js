const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require("path");

class Dashboard {
  constructor(client) {
    server.listen(client.config.webPort || 3000, () => {
      console.log("Listening on port 3000");
    });

    app.use(express.static(path.join(__dirname + "/static")))
  }
}

module.exports = Dashboard;
