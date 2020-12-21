let api = require('axios');
const { MessageEmbed } = require('discord.js');

const keyword = "xkcd";
const description = "Returns a random xkcd comic strip.";

module.exports = {
  keyword,
  description,
  listener: function(interaction) {
    const maxId = 2400; // This is the maximum ID that doesn't 404, as of 12/21/2020
    let random_number = Math.random() * maxId;
    let comicId = Math.floor(random_number);
    api.get(`https://xkcd.com/${comicId}/info.0.json`)
      .then(response => {
        const date = new Date(`${response.data.month}/${response.data.day}/${response.data.year}`)
        const embed = new MessageEmbed()
          .setTitle(response.data.safe_title)
          .setDescription(response.data.alt)
          .setImage(response.data.img)
          .setTimestamp(date)
          .setAuthor("XKCD");
        interaction.channel.send(embed);
      })
      .catch((e) => {
        console.log(`XKCD Comic GET Error: ${e}`);
        interaction.channel.send("Couldn't retrieve xkcd comic... m'kay.");
      });
  }
};
