const name = "ping";
const description = "... pong!";

module.exports = {
  name,
  description,
  listener: function(interaction) {
    interaction.channel.send(`<@${interaction.author.id}> pong`);
  }
};
