const db = require("../external/firebase");

const name = "reactions";
const description = "Manage the custom reactions for the server.";

module.exports = {
  name,
  description,
  options: [
    {
      type: 3,
      required: true,
      name: "Name",
      description: "Name of your custom reaction, this will be how you trigger the reaction. (i.e /name)"
    },
    {
      type: 3,
      required: true,
      name: "Reaction",
      description: "Text and/or URL reaction."
    },
  ],
  listener: async function(interaction, client, { isNameTaken, createCommand, updateCommand }) {
    // Regex turns all whitespace and special characters to dashes, but doesn't have dashes touch. (i.e. " !!!! happy !! stumpy !! " would be transformed into "happy-stumpy")
    const keyword = (interaction.options[0] && interaction.options[0].value)
      ? interaction.options[0].value.replace(/[^A-Z0-9]+/ig, "-").replace(/^-+|-+$/g,'')
      : false;
    const santizedKeyword = keyword.replace("-","");
    if(keyword && santizedKeyword !== "") {
      // If command name is not taken, create command and save reaction to Firebase
      if (!isNameTaken(keyword)) {
        const newCommand = { name: keyword, description: `Custom reaction created by: ${interaction.author.username}` };
        await createCommand(client, newCommand, interaction.guild.id)
          .then(async () => {
            await db.ref(`reactions/${interaction.guild.id}/${keyword}`).set({
              createdBy: interaction.author.username,
              updatedBy: interaction.author.username,
              updatedOn: new Date().toDateString(),
              response: interaction.options[1].value
            });
            interaction.channel.send(`<@${interaction.author.id}> /${keyword} has been created.`);
          })
          .catch(console.error);
      } else {
        // Check if name is a custom reaction already, if so - update the reference.
        // If not, tell user that the name is taken
        const dbRef = db.ref(`reactions/${interaction.guild.id}/${keyword}`);
        dbRef.once('value').then(async (snapshot) => {
          if (snapshot.val() !== null) {
            await dbRef.set({
              createdBy: snapshot.val().createdBy,
              updatedBy: interaction.author.username,
              updatedOn: new Date().toDateString(),
              response: interaction.options[1].value
            });
            interaction.channel.send(`<@${interaction.author.id}> /${keyword} has been updated.`);
          } else {
            interaction.channel.send(`<@${interaction.author.id}> That reaction name is taken.`);
          }
        });
      }
    } else {
      interaction.channel.send(`<@${interaction.author.id}> That reaction name is invalid.`);
    }
  }
};
