const { Pool } = require("pg"); // A Pool manages multiple client connections to PostgreSQL db so there's no need to open a new one for each query.

const ENV = process.env.NODE_ENV || "development"; // checks the environment variable NODE_ENV to see if running in development, test, or production, if not set, it defaults to development.

const path = `${__dirname}/../.env.${ENV}`; // __dirname  - current file's directory, builds the full relative path to the right .env file.

require("dotenv").config({ path }); //loads environment variables from the correct .env file into process.env, using the dotenv library.

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
    throw new Error("PGDATABASE or DATABASE_URL not set");
};

const config = {};

if (ENV === "production") {
    config.connectionString = process.env.DATABASE_URL;
    config.max = 2; // max limits the number of simultaneous clients in the pool to 2 for  free-tier Supabase hosting
};

const pool = new Pool(config); // creates the actual connection pool using the config defined above. If in development or test, no config is passed, so pg will use PGDATABASE.

module.exports = pool;