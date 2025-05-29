const { createNewUser } = require("../models/signupModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getNewUser = async(req, res, next) => {
    // get the details of the user
    const { first_name, surname, email, phone_number, role, avatar, password } = req.body;

    try {
        // hash the password 
        const password_hash = await bcrypt.hash(password, 10);

        // create the new user in the DB
        const newUser = await createNewUser(first_name, surname, email, phone_number, role, avatar, password_hash);
        
        //  generate a token after successful DB insert
        const { TOKEN_SECRET } = process.env;
        const token = jwt.sign(
            { user_id: newUser.user_id, role: newUser.role}, 
            TOKEN_SECRET, 
            { expiresIn: "1h" }
        );

        res.status(201).send({ user: newUser, token: token });

    } catch (err) {
        next(err);
    };
};

