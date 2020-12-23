const { MessageEmbed } = require('discord.js');
let api = require('axios');

const name = "ram";
const description = "Returns a Rick and Morty gif that, hopefully, matches your query.";

module.exports = {
  name,
  description,
  options: [{
    type: 3,
    required: true,
    name: "Query",
    description: "Search term to query for a gif."
  }],
  listener: function(interaction) {
    // Our search term can be multiple words, since we only have one parameter at the moment, let's just join together the params array into one string.
    let searchTerm = interaction.options[0].value;
    api.get(`https://masterofallscience.com/api/search?q=${encodeURIComponent(searchTerm)}`)
      .then(response => {
        // Check the response data to see if any results were found. If so, grab a random scene and then we need to hit the caption endpoint
        console.log("Rick and Morty Search GET Success");
        let results = response.data;
        if(results.length <= 0) {
          interaction.channel.send(`<@${interaction.author.id}> Nothing found for that term!`);
          return false;
        }

        let sceneIndex = Math.floor(Math.random() * results.length),
            sceneTimestamp = results[sceneIndex].Timestamp,
            sceneEpisode = results[sceneIndex].Episode;
        api.get(`https://masterofallscience.com/api/caption?e=${sceneEpisode}&t=${sceneTimestamp}`)
          .then(response => {
            // Grab the Scene Information, Create a Rich Embed and then send!
            console.log("Rick and Morty Scene GET Success");
            let episode = response.data.Episode,
                subtitles = response.data.Subtitles
                embed = new MessageEmbed();

            let gifStart = sceneTimestamp - 1250,
                gifEnd = sceneTimestamp + 2750;

            embed.setAuthor(episode.Title);

            // Check if subtitles is an odd number, if so shift the first index to the description and then we know the rest will be even (or 0).
            if(subtitles.length % 2 !== 0) {
              embed.setDescription(subtitles.shift().Content);
            }

            for(let i = 0; i < subtitles.length; i++) {
              // To get a zebra stripe effect, we're going to put two subtitles in a field at a time. If there isn't a "second subtitle" then we will subsitute for a blank string.
              let first = subtitles[i].Content,
                  second = subtitles[++i].Content;
              embed.addField(first, second);
            }

            embed.setFooter(`Season ${episode.Season} | Episode ${episode.EpisodeNumber}`);

            // Set Loading Message
            let placeholder;
            interaction.channel.send(`<@${interaction.author.id}> Loading Rick & Morty gif... m'kay`).then(loadingMsg => { 
              placeholder = loadingMsg; 
            });

            let gifUrl = `https://masterofallscience.com/gif/${sceneEpisode}/${gifStart}/${gifEnd}.gif`;
            api.get(gifUrl)
              .then(response => {
                // We set this timeout to help the rendering of the gif to be clearer. Not always helpful... but not having it is 100% awful
                setTimeout(function() {
                  embed.setImage(gifUrl);
                  placeholder.delete(); // Delete Loading Message
                  interaction.channel.send(embed);
                }, 2500);
              });
          })
          .catch(e => {
            // This isn't an official API (at least, I don't think so) so I'm not sure if there are true errors to handle besides a general fail.
            console.log(`Rick and Morty Scene GET Error: ${e}`);
            interaction.channel.send(`<@${interaction.author.id}> Something's messed up, m'kay. Couldn't retrieve scene information.`);
          })
      })
      .catch(e => {
        // This isn't an official API (at least, I don't think so) so I'm not sure if there are true errors to handle besides a general fail.
        console.log(`Rick and Morty Search GET Error: ${e}`);
        interaction.channel.send(`<@${interaction.author.id}> Something's messed up, m'kay. Couldn't retrieve search information.`);
      })
  }
};
