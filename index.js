let auth = require('./auth.json');
const Discord = require("discord.js");
const Interactions = require("./core/client/Interactions");
const Commands = require("./core/commands");

// create a new client
const client = new Discord.Client();
const token = auth.testBot ? auth.testToken : auth.token;
const clientID = auth.testBot ? auth.testClientID : auth.clientID;

// attach the interaction client to discord.js client
client.interactions = new Interactions(token, clientID);

// attach and event listener for the ready event
client.on("ready", () => {
  console.log("Client is ready!");

  // Create all commands
  Commands.initialize(client);
  // Set all listeners
  Commands.setListener(client);
});

// login
client.login(token);