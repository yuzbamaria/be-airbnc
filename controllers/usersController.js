const { fetchUser, updatePropertiesOfUser } = require("../models/usersModel");

exports.getUser = async(req, res, next) => {
    const { id: user_id } = req.params;
    try {
        const user = await fetchUser(user_id);
        res.status(200).send(user);
    } catch(err) {
        next(err);
    };
};

exports.updateUser = async(req, res, next) => {
    const { id: user_id } = req.params;
    const { first_name, surname, email, phone: phone_number, avatar } = req.body;

    try {
        const updatedUser = await updatePropertiesOfUser(user_id, first_name, surname, email, phone_number, avatar);
        res.status(200).send(updatedUser);  
    } catch (err) {
        next(err);   
    };
};