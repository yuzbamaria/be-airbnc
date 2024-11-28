const data = require("./data/test");
const seed = require("./seed.js");
const db = require("./connection.js");

seed(data).then(() => {
    db.end();
});
