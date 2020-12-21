const Commands = [
  require('./ping'),
];

module.exports.initialize = function() {
  Commands.forEach((command) => {
    if(typeof command.keyword === "string" && typeof command.description === "string") {
      client.interactions
        .createCommand({
          name: command.keyword,
          description: command.description
        })
        .catch(console.error)
        .then(console.log);
    }
  });
};

module.exports.setListener = function(client) {
  client.on("interactionCreate", (interaction) => {
    for(let i = 0; i < Commands.length; i++) {
      const command = Commands[i];
      if (command.keyword === interaction.name && typeof command.listener === "function") {
        command.listener(interaction);
        break;
      }
    }
  });
};
