const express = require("express");
const app = express();
const path = require("path");

class Dashboard {
  port;
  constructor(client) {
    this.port = client.config.webPort || 8080;
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname + "/views")));
    app.get("/", async (req, res) => {
      res.render("index");
    });
    app.listen(this.port, () => {
      console.log(`Dashboard running on http://localhost:${this.port}/`);
    });
  }
}

module.exports = Dashboard;
