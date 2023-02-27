const { spawn } = require("child_process");
const path = require("path");
const request = require("request");
const fs = require("fs");

const dbname = "db.json";
const port = 3001;
const URL_DATABASE = `http://127.0.0.1:${port}`;

module.exports = {
  initialized: false,
  init() {
    if (module.exports.initialized) return;
    // Verify dbFile exist and has right metadata
    fs.readFile(path.join(__dirname, dbname), "utf8", (err, data) => {
      if (err) {
        data = null;
      }

      database = data ? JSON.parse(data) : {};

      // Check if all REST entry are present
      if (!database.self) database.self = {};
      if (!database.followers) database.followers = [];

      fs.writeFile(
        path.join(__dirname, dbname),
        JSON.stringify(database, false, 2),
        (error) => {
          if (error) {
            console.log("An error has occurred ", error);
            return;
          }
        }
      );
    });

    // Start database server
    spawn(
      path.join(__dirname, "..", "node_modules", ".bin", "json-server.cmd"),
      [
        "--watch",
        path.join(__dirname, dbname),
        "--port",
        port,
        "--host",
        "0.0.0.0",
      ]
    );
    module.exports.initialized = true;
    console.log("json-server listening on port 3001!");
  },
  get(o) {
    return new Promise((res, rej) => {
      request(
        {
          uri: `${URL_DATABASE}/${o}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
        (err, resp, data) => {
          if (err) rej(err);
          else res(data);
        }
      );
    });
  },
  post(o, body) {
    return new Promise((res, rej) => {
      request(
        {
          uri: `${URL_DATABASE}/${o}`,
          body: JSON.stringify(body),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
        (err, resp, data) => {
          if (err) rej(err);
          else res(data);
        }
      );
    });
  },
};
