module.exports = {
  /*voteSkip: function(value) {

  }*/
  prefix: function(value, data) {
    this.handler.setCustomPrefix(data.msg.channel.server_id, value);
  }
}
