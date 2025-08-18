const { createNewUser } = require("../models/signupModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.getNewUser = async (req, res, next) => {
  // get the details of the user
  let { first_name, surname, email, phone_number, role, avatar, password } =
    req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .send({ msg: "email and password are required" });
    }

    // defaults for optional fields
    first_name = first_name || null;
    surname = surname || null;
    phone_number = phone_number || null;
    avatar = avatar || "https://example.com/default-avatar.png";
    role = role || undefined;

    // hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // create the new user in the DB
    const newUser = await createNewUser(
      first_name,
      surname,
      email,
      phone_number,
      role,
      avatar,
      password_hash
    );

    //  sign JWT - generate a token after successful DB insert
    const { TOKEN_SECRET } = process.env;
    const token = jwt.sign(
      { user_id: newUser.user_id, role: newUser.role },
      TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).send({ user: newUser, token: token });
  } catch (err) {
    next(err);
  }
};
