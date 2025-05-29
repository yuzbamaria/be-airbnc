const db = require("../db/connection");

// retrieve registered user
exports.retrieveRegisteredUser = async(email) => {

    const queryStr = `SELECT * FROM users WHERE email = $1`;
    try {
        const { rows: users } = await db.query(queryStr, [email]);
        if (users.length === 0) {
            return Promise.reject({ status: 400, msg: "User doesn't exist." });
        };

        return users[0];
    } catch (err) {
        console.error(err);
    }
};

// this.retrieveRegisteredUser('leia2@rebel.com')
//     .then(result => console.log(result))
//     .catch(err => console.log(err))