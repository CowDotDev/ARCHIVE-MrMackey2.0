let Twitter = require('../external/twitter.js');

const name = "twitter";
const description = "Retrieve tweet(s) from specified user.";

module.exports = {
  name,
  description,
  options: [
    {
      type: 3,
      required: true,
      name: "Handle",
      description: "Twitter handle to retrieve tweets from. (No leading @ required)"
    },
    {
      type: 4,
      required: true,
      name: "Quantity",
      description: "Number of tweets to return from the given handle.",
      choices: [
        { name: "One", value: 1 },
        { name: "Two", value: 2 },
        { name: "Three", value: 3 },
        { name: "Four", value: 4 },
        { name: "Five", value: 5 },
      ]
    }
  ],
  listener: function(interaction) {
    let screenName = interaction.options[0].value.replace('@',''),
        count = interaction.options[1].value;
    Twitter.getMostRecentTweetByScreenName(screenName, count, interaction);
  }
};
