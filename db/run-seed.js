const data = require("./data/dev/index.js");
const seed = require("./seed.js");
const db = require("./connection.js");

seed(data).then(() => {
    db.end();
});
