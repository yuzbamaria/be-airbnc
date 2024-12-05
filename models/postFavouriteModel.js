const db = require("../db/connection");

exports.postFavouriteById = async(guest_id, property_id) => {
    const queryStr = `
        INSERT INTO favourites
        (guest_id, property_id)
        VALUES ($1, $2)
        RETURNING *;`;
    const { rows } = await db.query(queryStr, [guest_id, property_id]);
    return rows[0];
};

