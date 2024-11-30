const manageTables = require("./manage-tables");

const  { 
    insertUsers, 
    insertPropertyTypes,
    insertProperties,
    insertFavourites, 
    insertReviews
} = require("./insert-data");

const { 
    lookUp, 
    lookUpProperties, 
    formatData, 
    orderProperties,
    selectHosts, 
    selectGuests,
    orderReviews
} = require("./utils.js");


async function seed({ users, propertyTypes, properties, favourites, reviews }) {
    
    // DROP AND CREATE TABLES
    await manageTables();  
    // try {
    //     
    //     console.log("Table created successfully.");
    // } catch (err) {
    //     console.error("Error creating table:", err);
    // };

    // INSERT DATA
    // INSERT USERS TABLE
    const { rows: insertedUsers } = await insertUsers(users);
    const hosts = selectHosts(insertedUsers);
    const hostRef = lookUp(hosts);

    const formattedProperties = formatData(hostRef, "host_name", "host_id", properties);
    const orderedProperties = orderProperties(formattedProperties);

    // INSERT PROPERTY_TYPES TABLE
    await insertPropertyTypes(propertyTypes);
    
    // INSERT PROPERTIES TABLE
    const { rows: insertedProperties } = await insertProperties(orderedProperties);

    const guests = selectGuests(insertedUsers);
    const guestRef = lookUp(guests);
    const propertyRef = lookUpProperties(insertedProperties);

    const formattedGuestsIDs = formatData(guestRef, "guest_name", "guest_id", favourites);
    const formattedFavourites = formatData(propertyRef, "property_name", "property_id", formattedGuestsIDs);
    
    // INSERT FAVOURITES TABLE
    await insertFavourites(formattedFavourites);

    const formattedReviewsGuestsNames = formatData(guestRef, "guest_name", "guest_id", reviews);
    const formattedReviews = formatData(propertyRef, "property_name", "property_id", formattedReviewsGuestsNames);
    const orderedReviews = orderReviews(formattedReviews);
    await insertReviews(orderedReviews);
};

module.exports = seed;