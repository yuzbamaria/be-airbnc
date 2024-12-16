const db = require("../db/connection");

exports.fetchUser = async(user_id) => {
    const queryStr = `
        SELECT 
            users.user_id,
            users.first_name,
            users.surname,
            users.email,
            users.phone_number,
            users.avatar,
            users.created_at
        FROM users
        WHERE user_id = $1;`;
    const { rows } = await db.query(queryStr, [user_id]);
    if(rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Resource not found." })
    };
    return { user: rows[0] };
};

exports.updatePropertiesOfUser = async(user_id, first_name, surname, email, phone_number, avatar) => {
    let queryStr = `UPDATE users SET `;
    const params = [user_id];
    const payload = { first_name, surname, email, phone_number, avatar };

    const definedProps = [];
    let paramIndex = 2;

    for (const key in payload) {
        if(payload[key] !== undefined) {
            definedProps.push(`${key} = $${paramIndex}`);
            params.push(payload[key]);
            paramIndex++;
        };
    };

    queryStr += definedProps.join(', ') + ` WHERE user_id = $1 RETURNING *;`;
    
    const { rows } = await db.query(queryStr, params);
    if(rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found." })
    };
    return rows[0];
};

exports.fetchUserBookings = async(guest_id) => {
    const queryStr = `
        SELECT DISTINCT 
            bookings.booking_id,
            bookings.check_in_date,
            bookings.check_out_date, 
            bookings.property_id,
            properties.name AS property_name,
            properties.host_id AS host,
            images.image_url AS image
        FROM bookings
        JOIN properties ON 
            bookings.property_id = properties.property_id 
        JOIN images ON
            bookings.property_id = images.property_id
        WHERE guest_id = $1
        ORDER BY
            bookings.check_in_date;`;

        const { rows } = await db.query(queryStr, [guest_id]);
        if(rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Resource not found." })
        };
        return { bookings: rows };
};