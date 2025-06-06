const db = require("./connection.js");
const format = require("pg-format");
const bcrypt = require("bcrypt");

exports.insertUsers = async(users) => {
    const hashedUsers = await Promise.all(
        users.map(async ({ 
                first_name, 
                surname, 
                email, 
                phone_number, 
                role, 
                avatar,
                password
            }) => {
                const password_hash = await bcrypt.hash(password, 10);
                return [first_name, surname, email, phone_number, role, avatar, password_hash];
            })
    );

    const queryStr = `INSERT INTO users
        (first_name, surname, email, phone_number, role, avatar, password_hash)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, hashedUsers));
};

exports.insertPropertyTypes = async(propertyTypes) => {
    const formattedPropertyTypes = propertyTypes.map(({ 
        property_type,
        description 
    }) => [property_type, description]);
    const queryStr = `INSERT INTO property_types
        (property_type, description)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, formattedPropertyTypes));
};

exports.insertProperties = async(properties) => {
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

exports.insertFavourites = async(favourites) => {
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

exports.insertReviews = async(reviews) => {
    const queryStr = `INSERT INTO reviews
        (property_id,
        guest_id, 
        rating, 
        comment)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, reviews))
};

exports.insertImages = async(images) => {
    const formattedImages = images.map((image) => {
        return [
            image.property_id,
            image.image_url,
            image.alt_text
        ];
    });
    const queryStr = `INSERT INTO images
        (property_id, image_url, alt_text)
        VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, formattedImages))
};

exports.insertBookings = async(bookings) => {
    const queryStr = `INSERT INTO bookings
    (property_id, guest_id, check_in_date, check_out_date)
    VALUES %L RETURNING *;`;
    return await db.query(format(queryStr, bookings));
};