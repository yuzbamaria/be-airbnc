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

// this.fetchUser(3).then(result => console.log(result));