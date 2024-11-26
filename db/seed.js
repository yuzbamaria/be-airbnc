const db = require("./connection");
const manageTables = require("./manage-tables");
const  { 
    insertUsers, 
    insertPropertyTypes 
} = require("./insert-data");
const { users, propertyTypes } = require("./data/test/index.js")

async function seed(users, propertyTypes) {
    
    // DROP AND CREATE TABLES
    try {
        await manageTables();  
        console.log("Table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    }

    // INSERT DATA 
    await insertUsers(users);
    await insertPropertyTypes(propertyTypes);
    db.end()
};
seed(users, propertyTypes);
module.exports = seed;