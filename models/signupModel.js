const db = require("../db/connection");

// create user
exports.createNewUser = async(first_name, surname, email, phone_number, role, avatar, password_hash) => {
    
    const queryStr = `
        INSERT INTO users
        (first_name, surname, email, phone_number, role, avatar, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING user_id, first_name, surname, email, phone_number, role, avatar;`;

    try {
        const { rows } = await db.query(queryStr, [
            first_name, 
            surname, 
            email, 
            phone_number, 
            role, 
            avatar, 
            password_hash
        ]);

        if (rows.length === 0) {
            return Promise.reject({ status: 400, msg: "User could not be created" });
        };
            
        return rows[0];

    } catch (err) {
        console.error(err);
    }
};