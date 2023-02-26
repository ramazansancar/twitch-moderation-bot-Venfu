module.exports = (username, accessToken, channel) => {
  const tmi = require("tmi.js");

  // Define configuration options
  const opts = {
    identity: {
      username: username,
      password: `oauth:${accessToken}`,
    },
    channels: [channel],
  };

  // Create a client with our options
  const client = new tmi.client(opts);

  // Register our event handlers (defined below)
  client.on("message", onMessageHandler);
  client.on("connected", onConnectedHandler);

  // Connect to Twitch:
  client.connect();

  // Called every time a message comes in
  function onMessageHandler(target, context, msg, self) {
    if (self) {
      return;
    } // Ignore messages from the bot

    // Remove whitespace from chat message
    const commandName = msg.trim();

    if (commandName === "!cmd") {
      client.say(target, cmd());
    }
    if (commandName === "!dé") {
      client.say(target, rollDice(6));
    }
    if (commandName.match(/^\!dé [0-9]*$/gim)) {
      client.say(target, rollDice(commandName.substr(4)));
    }
    if (commandName === "!ca") {
      client.say(target, ca());
    }
  }

  // COMMANDS
  function cmd() {
    return `Liste des commandes : \n
    !dé <nombre>\n
    !ca`;
  }

  // DE
  function rollDice(sides) {
    return `Vous avez obtenu un ${
      Math.floor(Math.random() * sides) + 1
    } (sur ${sides})`;
  }

  // CODE AMI
  function ca() {
    return "Code ami : SW-1007-3695-2904";
  }

  // Called every time the bot connects to Twitch chat
  function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }
};
