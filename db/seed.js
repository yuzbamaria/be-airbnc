const db = require("./connection");
const manageTables = require("./manage-tables");

const  { 
    insertUsers, 
    insertPropertyTypes,
    insertProperties 
} = require("./insert-data");

const { 
    lookUp,  
    formatData, 
    orderProperties,
    selectHosts
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

  
    const { rows: insertedUsers } = await insertUsers(users);
   
    const hosts = selectHosts(insertedUsers);
    console.log(hosts)
    const hostRef = lookUp(hosts);
    console.log(hostRef)
    const formattedProperties = formatData(hostRef, "host_name", "host_id", properties);
    const orderedProperties = orderProperties(formattedProperties);
    
 
    await insertPropertyTypes(propertyTypes);
    await insertProperties(orderedProperties);

    // const guestRef = lookUp(insertedUsers)

    db.end()
};
seed(users, propertyTypes, properties);
module.exports = seed;