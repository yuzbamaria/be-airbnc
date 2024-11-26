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

module.exports = { insertUsers };