const data = require("./data/test");
const seed = require("./seed.js");
const db = require("./connection.js");

// DELETE
const { users } = require("./data/test/index.js");
// console.log(users)

seed(data).then(() => {
    db.end();
});
