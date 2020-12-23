let api = require('axios');

const name = "chuck";
const description = "Generates a random Chuck Norris joke.";

module.exports = {
  name,
  description,
  listener: function(interaction) {
    api.get(`http://api.icndb.com/jokes/random`)
      .then(response => {
        let joke = response.data.value.joke;
        interaction.channel.send(`<@${interaction.author.id}> ${joke}`);
      })
      .catch(error => {
        console.log(`Chuck Norris Joke Get ERROR: ${error}`);
        interaction.channel.send(`<@${interaction.author.id}> Chuck Norris found out we were making fun of him... I couldn't get a joke, m'kay`);
      });
  }
};
