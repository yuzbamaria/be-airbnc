const { fetchReviews, createReview, removeReview } = require("../models/reviewsModel");

exports.getReviews = async(req, res, next) => {
    const { id: property_id } = req.params;
    try {
        const reviews = await fetchReviews(property_id);
        res.status(200).send(reviews);
    } catch (err) {
        next(err);
    };
};

exports.addReview = async(req, res, next) => {
    const { guest_id, rating, comment } = req.body;
    const { id: property_id } = req.params;
    try {
        const review = await createReview(property_id, guest_id, rating, comment);
        res.status(201).send(review);
    } catch (err) {
        next(err);
    };
};

exports.deleteReview = async(req, res, next) => {
    const { id: property_id } = req.params;
    try {
        await removeReview(property_id);
        res.status(204).send();
    } catch(err) {
        next(err);
    };
};