const { retrieveRegisteredUser } = require("../models/loginModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getRegisteredUser = async(req, res, next) => {
    const { email, password } = req.body; // retrieve username and password 

    try {
        const registeredUser = await retrieveRegisteredUser(email); // attempt to retrieve the user from the db, if it doesn't, send a message that the user doesn't exist 
        const hash = registeredUser.password_hash;  // if the user exists, make sure that the password they provided matches their password in db 
        const passwordsMatch = await bcrypt.compare(password, hash);

        if (passwordsMatch) {  // provide a user with a token if all of the above works 
            // generate a token 
            const { TOKEN_SECRET } = process.env;
            const token = jwt.sign(
                        { user_id: registeredUser.user_id, role: registeredUser.role}, 
                        TOKEN_SECRET, 
                        { expiresIn: "1h" }
                    );
            const { password_hash, ...safeUser } = registeredUser;
            res.status(201).send({ user: safeUser, token: token });
        } else {
        res.status(401).send({ msg: "Incorrect credentials."});
        }
    } catch (err) {
        next(err);
    }
}