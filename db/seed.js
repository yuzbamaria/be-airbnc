const db = require("./connection");
const manageTables = require("./manage-tables");
const  { 
    insertUsers 
} = require("./insert-data");
const { users } = require("./data/test/index.js")

async function seed(users) {
    
    // DROP AND CREATE TABLES
    try {
        await manageTables();  
        console.log("Table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    }

    // INSERT DATA 
    await insertUsers(users);
};
seed(users)
module.exports = seed;