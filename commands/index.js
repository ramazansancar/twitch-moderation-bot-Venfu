module.exports = {
  initialized: false,
  client: null,
  init: (username, accessToken, channel) => {
    if (module.exports.initialized) return;
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
    module.exports.client = new tmi.client(opts);

    // Register our event handlers (defined below)
    module.exports.client.on("message", onMessageHandler);
    module.exports.client.on("connected", onConnectedHandler);

    // Connect to Twitch:
    module.exports.client.connect();
    module.exports.channel = channel;
    module.exports.initialized = true;
  },
  sendText: (text) => {
    module.exports.client.say(`#${module.exports.channel}`, text);
  },
};

// Called every time a message comes in
function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  if (commandName === "!cmd") {
    module.exports.client.say(target, cmd());
  }
  if (commandName.match(/^\!dé( [0-9]*)?$/gim)) {
    module.exports.client.say(target, rollDice(commandName.substr(4)));
  }
  if (commandName.match(/^\!hug( \@?[A-z1-9_]*)?$/gim)) {
    module.exports.client.say(
      target,
      hug(context["display-name"], commandName.substr(5))
    );
  }
  if (commandName === "!ca") {
    module.exports.client.say(target, ca());
  }
}

// COMMANDS
function cmd() {
  return `Liste des commandes : 
    !dé <nombre> 🎲
    !ca 🌐
    !hug @ 🤗`;
}

// DE
function rollDice(sides) {
  if (!sides) sides = 6;
  return `Vous avez obtenu un ${
    Math.floor(Math.random() * sides) + 1
  } (sur ${sides})`;
}

// CODE AMI
function ca() {
  return "Code ami : SW-1007-3695-2904";
}

// HUG
function hug(from, to) {
  if (!to) to = "tous les viewers de la chaine";
  if (to.match(/^\@.*/gim)) to = to.substr(1);
  return `${from} envoie un gros câlin à ${to} ! 🤗🤗🤗`;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
