const Discord = require("discord.js");

const auth = require('./auth.json');
const Interactions = require("discord-slash-commands-client").Client;
const Commands = require("./core/commands");
const Twitter = require('./core/external/twitter.js');

// create a new client
const client = new Discord.Client();
const token = auth.testBot ? auth.testToken : auth.token;
const clientID = auth.testBot ? auth.testClientID : auth.clientID;

// attach the interaction client to discord.js client
client.interactions = new Interactions(token, clientID);

// attach and event listener for the ready event
client.on("ready", async () => {
  const botEnv = !auth.testBot ? 'Production' : 'Development';
  console.log(`Client is ready! - ${botEnv}`);

  // Connect to Twitter
  console.log("Connecting to Twitter...");
  Twitter.requestBearerToken();

  // Get list of all defined commands
  await Commands.getDefinedCommands(client);
  // Clean/Update defined commands - Remove commands no-longer exported in this repo, and update defined commands to ensure they are up-to-day.
  await Commands.cleanDefinedCommands(client);
  // Create all commands
  await Commands.createAllMissingCommands(client);
  // Set all listeners
  Commands.setListener(client);
});

// login
client.login(token);