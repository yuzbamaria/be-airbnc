const { fetchReviews } = require("../models/reviewsModel");

exports.getReviews = async(req, res, next) => {
    const { id: property_id } = req.params;
    // console.log(property_id)
    try {
        const reviews = await fetchReviews(property_id);
        // console.log(reviews)
        res.status(200).send(reviews);
    } catch (err) {
        console.log(err)
        next(err);
    };
};