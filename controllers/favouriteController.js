const { fetchFavourites, postFavouriteById, removeFavourite } = require("../models/favouriteModel");;

exports.getFavourites = async(req, res, next) => {
    try {
        const favourites = await fetchFavourites();
        res.status(200).send(favourites);
    } catch (err) {
        next(err);
    };
};

exports.createFavouriteById = async(req, res, next) => {
    const { guest_id } = req.body;
    const { id: property_id } = req.params;

    try {
        const favourite = await postFavouriteById(guest_id, property_id);
        res.status(201).send(favourite);
    } catch (err) {
        next(err);
    };
};

exports.deleteFavourite = async(req, res, next) => {
    const { id: favourite_id } = req.params;
    try {
        await removeFavourite(favourite_id);
        res.status(204).send();
    } catch(err) {
        next(err);
    };
};