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
// this.updatePropertiesOfUser(2, "Moooo", "BOOOOO", undefined, '1234567890', undefined, undefined).then(result => console.log(result));