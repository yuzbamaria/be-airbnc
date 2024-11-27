const db = require("./connection");
const manageTables = require("./manage-tables");

const  { 
    insertUsers, 
    insertPropertyTypes,
    insertProperties,
    insertFavourites
} = require("./insert-data");

const { 
    lookUp, 
    lookUpProperties, 
    formatData, 
    orderProperties,
    selectHosts, 
    selectGuests
} = require("./utils.js");

const { users, propertyTypes, properties, favourites } = require("./data/test/index.js")

async function seed(users, propertyTypes, properties, favourites) {
    
    // DROP AND CREATE TABLES
    try {
        await manageTables();  
        console.log("Table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    }

    // INSERT DATA
    const { rows: insertedUsers } = await insertUsers(users);
    const hosts = selectHosts(insertedUsers);
    const hostRef = lookUp(hosts);

    const formattedProperties = formatData(hostRef, "host_name", "host_id", properties);
    const orderedProperties = orderProperties(formattedProperties);
    
    await insertPropertyTypes(propertyTypes);
    const { rows: insertedProperties } = await insertProperties(orderedProperties);
    // console.log(insertedProperties)

    const guests = selectGuests(insertedUsers);
    const guestRef = lookUp(guests);
    const propertyRef = lookUpProperties(insertedProperties);
    // console.log(propertyRef)
    const formattedGuestsIDs = formatData(guestRef, "guest_name", "guest_id", favourites);
    const formattedFavourites = formatData(propertyRef, "property_name", "property_id", formattedGuestsIDs);
    // console.log(formattedFavourites);
    await insertFavourites(formattedFavourites);
    db.end()
};
seed(users, propertyTypes, properties, favourites);
module.exports = seed;