let auth = require('../../auth.json');

const Commands = [
  require('./drugs'),
  require('./ping'),
  require('./pizza'),
  require('./xkcd'),
];

module.exports.initialize = function(client) {
  Commands.forEach((command) => {
    if(typeof command.keyword === "string" && typeof command.description === "string") {
      client.interactions
        .createCommand({
          name: command.keyword,
          description: command.description
        }, auth.testBot ? auth.testServerID : undefined)
        .catch(console.error)
        .then(console.log);
    }
  });
};

module.exports.setListener = function(client) {
  client.on("interactionCreate", (interaction) => {
    for(let i = 0; i < Commands.length; i++) {
      const command = Commands[i];
      if (command.keyword.toLowerCase() === interaction.name && typeof command.listener === "function") {
        command.listener(interaction);
        break;
      }
    }
  });
};
