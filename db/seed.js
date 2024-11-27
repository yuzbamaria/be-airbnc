const db = require("./connection");
const manageTables = require("./manage-tables");

const  { 
    insertUsers, 
    insertPropertyTypes,
    insertProperties 
} = require("./insert-data");

const { 
    createFullNames,  
    formatData, 
    orderProperties
} = require("./utils.js");

const { users, propertyTypes, properties } = require("./data/test/index.js")

async function seed(users, propertyTypes, properties) {
    
    // DROP AND CREATE TABLES
    try {
        await manageTables();  
        console.log("Table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    }

    // INSERT DATA 
    const { rows: insertedUsers } = await insertUsers(users);
    const hostRef = createFullNames(insertedUsers);
    const formattedProperties = formatData(hostRef, "host_name", "host_id", properties);
    console.log(formattedProperties)
    const orderedProperties = orderProperties(formattedProperties);
    console.log(orderedProperties)
          
    await insertPropertyTypes(propertyTypes);
    await insertProperties(orderedProperties);

    db.end()
};
seed(users, propertyTypes, properties);
module.exports = seed;