const db = require("../db/connection");

exports.fetchFavourites = async () => {
    const queryStr = `SELECT * from favourites;`;
    const {rows} = await db.query(queryStr);
    return { favourites : rows};
};

exports.postFavouriteById = async(guest_id, property_id) => {

    // validate guest_id exists in db by user_id & role
    const result = await db.query(`SELECT user_id FROM users 
        WHERE user_id = $1 AND role = 'guest'`, [guest_id]);
    if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Guest not found"});
    };

    // validate property_id hasn't been added yet to favourites by user_id
    const dbResult = await db.query(`SELECT * FROM favourites
        WHERE guest_id = $1 AND property_id = $2`, [guest_id, property_id]);
    if (dbResult.rows.length >= 1) {
        return Promise.reject({ status: 409, msg: "You've already favourited this property."});
    };

    const queryStr = `
        INSERT INTO favourites
        (guest_id, property_id)
        VALUES ($1, $2)
        RETURNING *;`;
    const { rows } = await db.query(queryStr, [guest_id, property_id]);
    
    return {
        msg: "Property favourited successfully.",
        favourite_id: rows[0].favourite_id
    };
};

exports.removeFavourite = async(favourite_id) => {
    const queryStr = `DELETE FROM favourites WHERE favourite_id = $1 RETURNING *;`;
    const result = await db.query(queryStr, [favourite_id]);
    if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Favourite not found."});
    };
};


