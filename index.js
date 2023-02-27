/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

// Define our dependencies
var express = require("express");
var session = require("express-session");
var passport = require("passport");
var OAuth2Strategy = require("passport-oauth").OAuth2Strategy;
var request = require("request");
var path = require("path");

// Export secrets to config file
require("dotenv").config();
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_SECRET = process.env.TWITCH_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;
const BOT_USERNAME = process.env.BOT_USERNAME;
const CHANNEL = process.env.CHANNEL;

const URL_CALLBACK = "http://localhost:3000/auth/twitch/callback";
const URL_TWITCH_AUTHORIZE = "https://id.twitch.tv/oauth2/authorize";
const URL_TWITCH_TOKEN = "https://id.twitch.tv/oauth2/token";

// Commands
vCommands = require("./commands/index.js");
// Websocket
vWebSockets = require("./websocket-events/index.js");
// Database
vDataBase = require("./db/index.js");
vDataBase.init();

// Initialize Express and middlewares
var app = express();
app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
);
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
  var options = {
    url: "https://api.twitch.tv/helix/users",
    method: "GET",
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Accept: "application/vnd.twitchtv.v5+json",
      Authorization: "Bearer " + accessToken,
    },
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  "twitch",
  new OAuth2Strategy(
    {
      authorizationURL: URL_TWITCH_AUTHORIZE,
      tokenURL: URL_TWITCH_TOKEN,
      clientID: TWITCH_CLIENT_ID,
      clientSecret: TWITCH_SECRET,
      callbackURL: URL_CALLBACK,
      state: true,
    },
    function (accessToken, refreshToken, profile, done) {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;

      // Securely store user profile in your DB
      //User.findOrCreate(..., function(err, user) {
      //  done(err, user);
      //});

      vDataBase.post("self", profile).then(() => {});

      done(null, profile);
    }
  )
);

// Set route to start OAuth link, this is where you define scopes to request
app.get(
  "/auth/twitch",
  passport.authenticate("twitch", {
    scope: ["user_read", "chat:read", "chat:edit", "moderator:read:followers"],
  })
);

// Set route for OAuth redirect
app.get(
  "/auth/twitch/callback",
  passport.authenticate("twitch", {
    successRedirect: "/",
    failureRedirect: "/",
  })
);

// If user has an authenticated session, display it, otherwise display link to authenticate
app.get("/", function (req, res) {
  if (req.session && req.session.passport && req.session.passport.user) {
    // Serve static files + index
    res.sendFile(path.join(__dirname, "front", "index.html"));
    app.use(express.static(path.join(__dirname, "front")));

    // Start Chatbot commands
    vCommands(BOT_USERNAME, req.session.passport.user.accessToken, CHANNEL);

    // Start Websocket Client
    vWebSockets.init().then(() => {
      // Subscribe to Websockets Events
      vWebSockets.subscribeToFollowEvent(
        TWITCH_CLIENT_ID,
        req.session.passport.user.accessToken,
        req.session.passport.user.data[0].id
      );
      vWebSockets.subscribeToSubEvent(
        TWITCH_CLIENT_ID,
        req.session.passport.user.accessToken,
        req.session.passport.user.data[0].id
      );
    });
  } else {
    // If not connected then connect
    res.send(
      `<html>
      <head>
        <title>Twitch Auth Sample</title>
      </head>
      <body>
        <script>
          window.location = '/auth/twitch';
        </script>
      </body>
      </html>`
    );
  }
});

app.listen(3000, function () {
  console.log("Twitch auth sample listening on port 3000!");
});
