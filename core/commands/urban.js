let api = require('axios');
const { MessageEmbed } = require('discord.js');

const keyword = "urban";
const description = "Given a term, will return a matching definition from Urban Dictionary.";

module.exports = {
  keyword,
  description,
  options: [{
    type: 3,
    required: true,
    name: "Query",
    description: "Search term to query for a definition."
  }],
  listener: function(interaction) {
    const search = interaction.options[0].value,
          searchUriEncoded = encodeURIComponent(search);

    var placeholder;
    interaction.channel.send(`<@${interaction.author.id}> Checking rolodex... m'kay`).then(loadingMsg => { 
      placeholder = loadingMsg;
    
      api.get(`http://api.urbandictionary.com/v0/define?term=${searchUriEncoded}`)
        .then((response) => {
          const results = response.data.list;

          if(results.length > 0) {
            let embed = new MessageEmbed();
            embed.setAuthor(`Urban Dictionary ${results.length > 1 ? "Definitions" : "Definition"}`);
            embed.setDescription(`Search Term: ${search}`);

            let def = results[0];
            embed.addField(
              `**Definition by:** ${def.author}`, 
              `**Definition:** ${def.definition}
              **Example:** ${def.example}`
            )

            embed.setURL(def.permalink);
            embed.setFooter(def.permalink);

            placeholder.delete();
            interaction.channel.send(embed);
          } else {
            placeholder.delete();
            interaction.channel.send(`<@${interaction.author.id}> No urban definition for ${search}, it can mean whatever you want m'kay...`);
          }
        })
        .catch((e) => {
          console.error(e);
          placeholder.delete();
          interaction.channel.send(`<@${interaction.author.id}> There was an error getting the definition, m'kay...`);
        })
    });
  }
};
