var websocket = require("ws");
var request = require("request");
vDataBase = require("../db/index.js");

const URL_EVENTS_SUBSCRIPTION =
  "https://api.twitch.tv/helix/eventsub/subscriptions";

const URL_WEBSOCKET = "wss://eventsub-beta.wss.twitch.tv/ws";
// const URL_WEBSOCKET = "ws://localhost:8080/eventsub"; // mock

module.exports = {
  sessionID: "",
  init: () => {
    return new Promise((done, rej) => {
      const ws = new websocket(URL_WEBSOCKET);

      ws.on("message", (data) => {
        data = JSON.parse(data);
        if (data.metadata.message_type === "session_welcome") {
          module.exports.sessionID = data.payload.session.id;
          done();
        }
        if (
          data.metadata.message_type === "notification" &&
          data.metadata.subscription_type === "channel.follow"
        ) {
          // TODO : new follow implementation
        }
      });
    });
  },
  subscribeToFollowEvent: (clientID, accessToken, userID) => {
    var postData = {
      type: "channel.follow",
      version: "2",
      condition: { broadcaster_user_id: userID, moderator_user_id: userID },
      transport: {
        method: "websocket",
        session_id: module.exports.sessionID,
      },
    };
    var clientServerOptions = {
      uri: URL_EVENTS_SUBSCRIPTION,
      body: JSON.stringify(postData),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": clientID,
      },
    };
    request(clientServerOptions, function (error, response) {
      console.log("Subscribe to Follow Events", response.body);
      return;
    });
  },
  subscribeToSubEvent: (clientID, accessToken, userID) => {},
};
