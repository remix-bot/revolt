const RevoltBots = require('revoltbots.js');

class RBL {
  remix;
  api;
  constructor(remix) {
    this.api = new RevoltBots.Client(remix.config.rbl.token);
    this.remix = remix;

    remix.client.once("ready", () => {
      this.post();
    });
    remix.client.on("serverCreate", () => {
      this.post();
    });
    remix.client.on("serverDelete", () => {
      this.post();
    });
  }
  post() {
    this.api.postStats(this.remix.client).then(result => {
      if (!result.message == "Successfully updated.") console.log(result);
    });
  }
}

module.exports = RBL;
