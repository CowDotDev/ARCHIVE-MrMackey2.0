const keyword = "pizza";
const description = "What time is it?";

module.exports = {
  keyword,
  description,
  listener: function(interaction) {
    interaction.channel.send({
      files: [{
        attachment: "https://media1.tenor.com/images/7a71a41ed97deac3853402c2b747895d/tenor.gif"
      }]
    });
  }
};
