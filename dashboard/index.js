const express = require("express");
const app = express();
const path = require("path");

// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static
app.use(express.static(path.join(__dirname + "/static")))

// home page
app.get("/", async (req, res) => {
    res.render("index");
});

// connect
app.listen(8080, () => {
    console.log("Dashboard running on http://localhost:8080/");
});
