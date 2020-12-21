const keyword = "ping";
const description = "... pong!";

module.exports = {
  keyword,
  description,
  listener: function(interaction) {
    interaction.channel.send("pong");
  }
};
