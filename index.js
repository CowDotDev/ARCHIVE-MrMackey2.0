let auth = require('./auth.json');
const Discord = require("discord.js");
const Interactions = require("./core/client/Interactions");
const Commands = require("./core/commands");

// create a new client
const client = new Discord.Client();

// attach the interaction client to discord.js client
client.interactions = new Interactions(auth.token, auth.clientID);

// attach and event listener for the ready event
client.on("ready", () => {
  console.log("Client is ready!");

  // Create all commands
  Commands.initialize();
  // Set all listeners
  Commands.setListener(client);
});

// login
client.login(auth.token);