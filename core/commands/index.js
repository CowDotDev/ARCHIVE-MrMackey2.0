let auth = require('../../auth.json');

const Commands = [
  require('./chuck'),
  require('./drugs'),
  require('./ping'),
  require('./pizza'),
  require('./ram'),
  require('./twitter'),
  require('./urban'),
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
        })
        .catch((e) => {
          console.error(`Error creating command /${command.keywork}: ${JSON.stringify(e.response.data.errors)}`)
        })
        .then(() => {
          console.log(`Created command: /${command.keyword}`);
        });
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
