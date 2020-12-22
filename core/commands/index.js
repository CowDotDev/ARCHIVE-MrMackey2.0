let auth = require('../../auth.json');

const Commands = [
  require('./drugs'),
  require('./ping'),
  require('./pizza'),
  require('./twitter'),
  require('./xkcd'),
];

module.exports.initialize = function(client) {
  Commands.forEach((command) => {
    if(typeof command.keyword === "string" && typeof command.description === "string") {
      client.interactions
        .createCommand({
          name: command.keyword,
          description: command.description,
          options: typeof command.options !== "undefined" ? command.options : undefined
        }, auth.testBot ? auth.testServerID : undefined)
        .catch((e) => {
          console.error(JSON.stringify(e.response.data.errors))
        })
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
