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
    const queryStr = `INSERT INTO properties
        (host_id,
        name, 
        location,
        property_type,
        price_per_night,
        description)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, properties));
};

async function insertFavourites(favourites) {
    const formattedFavourites = favourites.map((favourite) => {
        return [
            favourite.guest_id,
            favourite.property_id
        ];
    });
    const queryStr = `INSERT INTO favourites
        (guest_id,
        property_id)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, formattedFavourites));
};

async function insertReviews(reviews) {
    const queryStr = `INSERT INTO reviews
        (property_id,
        guest_id, 
        rating, 
        comment)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, reviews))

}

module.exports = { insertUsers, insertPropertyTypes, insertProperties, insertFavourites, insertReviews };