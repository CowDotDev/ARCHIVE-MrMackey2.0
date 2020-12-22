let auth = require('../../auth.json');

// Sets guildID if auth.testBot
// If auth.testBot is false, all requests will be "global"
const guildID = auth.testBot ? auth.testServerID : false;

// Commands holds all the slash command defintions
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
// CommandsKeywordsIndex holds all the slash command definitions, indexed by their keyword
const CommandsKeywordsIndex = (function() {
  let array = [];
  for(let i = 0; i < Commands.length; i++) {
    let command = Commands[i];
    array[command.keyword] = command;
  };
  return array;
})();

// definedCommands holds the existing commands already created.
// definedCommandsKeywords holds all the existing keywords - to help determine which should be purged.
let definedCommands = [];
let definedCommandsKeywords = [];

/**
 * getDefinedCommands
 * @param {DiscordJSClient} client
 * Saves all the existing commands that our bot already knows.
 */
const getDefinedCommands = async function(client) {
  await client.interactions.getCommands(false, guildID)
    .then((res) => {
      console.log("Retrieved existing commands.");
      definedCommands = res;
    })
    .catch((e) => { console.error(JSON.stringify(e.response.data.errors)) });
};

/**
 * cleanDefinedCommands
 * @param {DiscordJSClient} client 
 * Deletes existing commands if they are no longer defined in this repo.
 * Edits/Updates existing commands to ensure their configuration is up-to-date.
 */
const cleanDefinedCommand = async function(client, index) {
  const definedCommand = definedCommands[index];
  let name = definedCommand.name;
  let shouldDelete = typeof CommandsKeywordsIndex[name] === "undefined";
  
  definedCommandsKeywords.push(name);
  if(shouldDelete) {
    await deleteCommand(client, definedCommand);
  } else {
    await updateCommand(client, definedCommand, CommandsKeywordsIndex[name]);
  }

  if (++index < definedCommands.length) {
    await cleanDefinedCommand(client, index);
  } else {
    return;
  }
}
const cleanDefinedCommands = async function(client) {
  if(definedCommands.length > 0) await cleanDefinedCommand(client, 0);
};

/**
 * createCommand
 * @param {DiscordJSClient} client 
 * @param {Object} command 
 * Save new command on Discord, for our bot. If auth.testBot is true, we will save the command only on the auth.testServerID provided.
 */
const createCommand = async function(client, command) {
  await client.interactions
    .createCommand({
      name: command.keyword,
      description: command.description,
      options: typeof command.options !== "undefined" ? command.options : undefined
    }, guildID)
    .then(() => {
      console.log(`Created command: /${command.keyword}`);
    })
    .catch((e) => {
      console.error(`Error creating command /${command.keywork}: ${JSON.stringify(e.response.data.errors)}`)
    });
};
const createAllMissingCommands = async function(client) {
  for(let i = 0; i < Commands.length; i++) {
    const command = Commands[i];
    if(typeof command.keyword === "string" &&
      typeof command.description === "string" &&
      definedCommandsKeywords.indexOf(command.keyword) < 0) {
      await createCommand(client, command);
    }
  };
};

/**
 * updateCommand
 * @param {DiscordJSClient} client 
 * @param {Object} currentDefinition 
 * @param {Object} updatedCommand 
 * Will update the existing defintion of the command to match the repo's definitions.
 */
const updateCommand = async function(client, currentDefinition, updatedCommand) {
  await client.interactions.editCommand({
    name: updatedCommand.keyword,
    description: updatedCommand.description,
    options: typeof updatedCommand.options !== "undefined" ? updatedCommand.options : undefined
  }, currentDefinition.id, guildID)
    .then(() => {
      console.log(`Updated command: /${updatedCommand.keyword}`);
    })
    .catch((e) => { console.error(JSON.stringify(e.response.data.errors)) });
};

/**
 * deleteCommand
 * @param {DiscordJSClient} client 
 * @param {Object} currentDefinition 
 * Removes the existing definition from Discord, for the bot.
 */
const deleteCommand = async function(client, currentDefinition) {
  await client.interactions.deleteCommand(currentDefinition.id, guildID)
    .then(() => {
      console.log(`Deleted command: /${currentDefinition.name}`);
    })
    .catch((e) => { console.error(JSON.stringify(e.response.data.errors)) });;
};

/**
 * setListener
 * @param {DiscordJSClient} client 
 * Initializes the listener that will fire everytime a user executes a slash command, and will route the request to the command's listener method.
 */
const setListener = function(client) {
  client.on("interactionCreate", (interaction) => {
    for(let i = 0; i < Commands.length; i++) {
      const command = Commands[i];
      if (command.keyword.toLowerCase() === interaction.name && typeof command.listener === "function") {
        command.listener(interaction);
        break;
      }
    }
  });
  console.log("Listening for commands...")
};

module.exports = {
  getDefinedCommands,
  cleanDefinedCommands,
  createAllMissingCommands,
  createCommand,
  updateCommand,
  deleteCommand,
  setListener
};
