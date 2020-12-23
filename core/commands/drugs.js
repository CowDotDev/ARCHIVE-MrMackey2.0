const name = "drugs";
const description = "Let them know how Mr.Mackey feels about drugs.";

module.exports = {
  name,
  description,
  listener: function(interaction) {
    interaction.channel.send("Drugs are bad, m'kay.");
  }
};
