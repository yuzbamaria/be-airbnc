const { Pool } = require("pg");

const path = `${__dirname}/../.env.test`;

require("dotenv").config({ path });

if (!process.env.PGDATABASE) {
    throw new Error("PGDATABASE not set");
};

const pool = new Pool();

module.exports = pool;