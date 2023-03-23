const express = require("express");
const path = require("path");

class Dashboard {
  port;
  app = express();
  constructor(client) {
    this.port = client.config.webPort || 3000;
    this.app.set("view engine", "ejs");
    this.app.set("views", [path.join(__dirname, "views")]);
    this.app.use(express.static(path.join(__dirname + "/views")));
    this.app.get("/", async (_req, res) => {
      res.render("index.ejs");
    });
    this.app.get("/login", (_req, res) => {
      res.render("login/index.ejs")
    })
    this.app.listen(this.port, () => {
      console.log(`Dashboard running on http://localhost:${this.port}/`);
    });
  }
}

module.exports = Dashboard;
