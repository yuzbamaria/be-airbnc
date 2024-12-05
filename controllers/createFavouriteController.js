const { postFavouriteById } = require("../models/postFavouriteModel");;

exports.createFavouriteById = async(req, res, next) => {
    const { guest_id } = req.body;
    const { id: property_id } = req.params;

    try {
        const favourite = await postFavouriteById(
            guest_id, 
            property_id
        );
        console.log(favourite)
        res.status(201).send(favourite);
    } catch (err) {
        console.log(err);
    };

};