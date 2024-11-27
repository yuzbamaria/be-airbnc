const db = require("./connection.js");
const format = require("pg-format");

async function insertUsers(users) {
    const formattedUsers = users.map(({ 
        first_name, 
        surname, 
        email, 
        phone_number, 
        role, 
        avatar 
    }) => [first_name, surname, email, phone_number, role, avatar]);
    const queryStr = `INSERT INTO users
        (first_name, surname, email, phone_number, role, avatar)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, formattedUsers));
};

async function insertPropertyTypes(propertyTypes) {
    const formattedPropertyTypes = propertyTypes.map(({ 
        property_type,
        description 
    }) => [property_type, description]);
    const queryStr = `INSERT INTO property_types
        (property_type, description)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, formattedPropertyTypes));
};

async function insertProperties(properties) {
    const formattedProperties = properties.map(({ 
        host_id,
        name, 
        location,
        property_type,
        price_per_night,
        description
    }) => [host_id,
        name, 
        location,
        property_type,
        price_per_night,
        description]);
    const queryStr = `INSERT INTO properties
        (host_id,
        name, 
        location,
        property_type,
        price_per_night,
        description)
        VALUES L% RETURNING *;`;
    return await db.query(quesryStr, formattedProperties);
};

module.exports = { insertUsers, insertPropertyTypes, insertProperties };