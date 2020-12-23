let auth = require('../../auth.json');
const db = require("../external/firebase");

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
  require('./reactions'),
  require('./twitter'),
  require('./urban'),
  require('./xkcd'),
];
// CommandNamesIndex holds all the slash command definitions, indexed by their name
const CommandNamesIndex = (function() {
  let array = [];
  for(let i = 0; i < Commands.length; i++) {
    let command = Commands[i];
    array[command.name] = command;
  };
  return array;
})();

// definedCommands holds the existing commands already created.
// definedCommandNames holds all the existing names - to help determine which should be purged.
let definedCommands = [];
let definedCommandNames = [];
let definedReactions = [];

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
      definedCommands.forEach(command => { definedCommandNames.push(command.name); })
    })
    .catch((e) => { console.error(JSON.stringify(e)) });
};

/**
 * getCustomReactionCommands
 * Adds all defined custom reactions to the definedCommandNames array
 */
const getCustomReactionCommands = async function() {
  await db.ref("reactions").once("value").then((snapshot) => {
    if(snapshot.val() !== null) {
      definedReactions = snapshot.val();
    }
    console.log("Retrieved existing custom reaction commands.");
  });
};

/**
 * isNameTaken
 * @param {String} name 
 * Returns a Boolean based on whether or not definedCommandNames has reference to the supplied name.
 */
const isNameTaken = function(name) {
  return definedCommandNames.indexOf(name) >= 0;
}

/**
 * cleanDefinedCommands
 * @param {DiscordJSClient} client 
 * Deletes existing commands if they are no longer defined in this repo.
 * Edits/Updates existing commands to ensure their configuration is up-to-date.
 */
const cleanDefinedCommand = async function(client, index) {
  const definedCommand = definedCommands[index];
  let name = definedCommand.name;
  let shouldDelete = typeof CommandNamesIndex[name] === "undefined";
  let isCustomReaction = typeof definedReactions[name] !== "undefined";

  if(shouldDelete && !isCustomReaction) {
    await deleteCommand(client, definedCommand);
  } else if(!isCustomReaction) {
    await updateCommand(client, definedCommand, CommandNamesIndex[name]);
  } else {
    console.log(`Verified reaction command: /${name}`);
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
const createCommand = async function(client, command, forceGuildID) {
  return await client.interactions
    .createCommand({
      name: command.name,
      description: command.description,
      options: typeof command.options !== "undefined" ? command.options : undefined
    }, forceGuildID ? forceGuildID : guildID)
    .then(() => {
      definedCommandNames.push(command.name);
      console.log(`Created command: /${command.name}`);
    }).catch((e) => {
      console.error(`Error creating command /${command.name}: ${JSON.stringify(e)}`);
      throw new Error("Error creating command");
    });
};
const createAllMissingCommands = async function(client) {
  for(let i = 0; i < Commands.length; i++) {
    const command = Commands[i];
    if(typeof command.name === "string" &&
      typeof command.description === "string" &&
      !isNameTaken(command.name)) {
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
const updateCommand = async function(client, currentDefinition, updatedCommand, forceGuildID) {
  await client.interactions.editCommand({
    name: updatedCommand.name,
    description: updatedCommand.description,
    options: typeof updatedCommand.options !== "undefined" ? updatedCommand.options : undefined
  }, currentDefinition.id, forceGuildID ? forceGuildID : guildID)
    .then(() => {
      console.log(`Updated command: /${updatedCommand.name}`);
    })
    .catch((e) => { console.error(JSON.stringify(e)) });
};

/**
 * deleteCommand
 * @param {DiscordJSClient} client 
 * @param {Object} currentDefinition 
 * Removes the existing definition from Discord, for the bot.
 */
const deleteCommand = async function(client, currentDefinition, forceGuildID) {
  await client.interactions.deleteCommand(currentDefinition.id, forceGuildID ? forceGuildID : guildID)
    .then(() => {
      const index = definedCommandNames.indexOf(currentDefinition.name);
      definedCommandNames.splice(index, 1);
      console.log(`Deleted command: /${currentDefinition.name}`);
    })
    .catch((e) => { console.error(JSON.stringify(e)) });;
};

/**
 * runCustomReaction
 * @param {DiscordJSClient} client 
 * @param {DiscordInteraction} interaction 
 * Tries to grab the custom reaction response from Firebase.
 */
const runCustomReaction = async function(client, interaction) {
  await db.ref(`reactions/${interaction.guild.id}/${interaction.name}`).once("value").then((snapshot) => {
    if(snapshot.val() !== null) {
      interaction.channel.send(snapshot.val().response);
    } else {
      deleteCommand(client, interaction, interaction.guild.id);
      interaction.channel.send(`<@${interaction.author.id}> Sorry, but /${interaction.name} doesn't seem to be a valid command, m'kay... I've deleted it.`);
    }
  })
}

/**
 * setListener
 * @param {DiscordJSClient} client 
 * Initializes the listener that will fire everytime a user executes a slash command, and will route the request to the command's listener method.
 */
const setListener = function(client) {
  client.on("interactionCreate", (interaction) => {
    let checkCustomReactions = true;
    for(let i = 0; i < Commands.length; i++) {
      const command = Commands[i];
      if (command.name.toLowerCase() === interaction.name && typeof command.listener === "function") {
        command.listener(interaction, client, CommandsExport);
        checkCustomReactions = false;
        break;
      }
    }
    if(checkCustomReactions) runCustomReaction(client, interaction);
  });
  console.log("Listening for commands...")
};

const CommandsExport = {
  getDefinedCommands,
  getCustomReactionCommands,
  cleanDefinedCommands,
  createAllMissingCommands,
  createCommand,
  updateCommand,
  deleteCommand,
  setListener,
  isNameTaken
};
module.exports = CommandsExport;
