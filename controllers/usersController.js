const { fetchUser } = require("../models/usersModel");

exports.getUser = async(req, res, next) => {
    const { id: user_id } = req.params;
    try {
        const user = await fetchUser(user_id);
        res.status(200).send(user);
    } catch(err) {
        next(err);
    };
};