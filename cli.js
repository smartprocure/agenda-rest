#!/usr/bin/env node

const program = require("commander");

program
  .option("-u, --dburi <dburi>", "[optional] Full Mongo connection string")
  .option("-d, --dbname <dbname>", "[optional] Name of the Mongo database")
  .option("-h, --dbhost <dbhost>", "[optional] Mongo instance's IP")
  .option(
    "-p, --port <port>",
    "[optional] Server port, default 4040",
    (n, d) => Number(n) || d,
    4040
  )
  .option("-k, --key <key>", "[optional] X-API-KEY to be expected in headers")
  .option(
    "-t, --timeout <timeout>",
    "[optional] Timeout for request duration",
    (n, d) => Number(n) || d,
    5000
  )
  .option(
    "-a, --agenda_settings <agenda_settings>",
    "[optional] A JSON string containing additional agenda settings."
  )
  .parse(process.argv);

const settings = require("./settings");

let values = program._optionValues

settings.dburi = values.dburi || settings.dburi;
settings.dbname = values.dbname || settings.dbname;
settings.dbhost = values.dbhost || settings.dbhost;
settings.appId = values.key || settings.appId;
settings.timeout = values.timeout || settings.timeout;
if (values.agenda_settings) {
  settings.agenda = JSON.parse(values.agenda_settings);
}

const { app, agenda } = require("./dist");

const server = app.listen(values.port, () => {
  console.log(`App listening on port ${values.port}.`);
});

async function graceful() {
  console.log("\nClosing server...");
  await server.close();
  console.log("Shutting down gracefully...");
  await agenda.stop();
  process.exit(0);
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
