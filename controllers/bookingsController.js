const { fetchBookings } = require("../models/bookingsModel");

exports.getBookings = async(req, res, next) => {
    const { id: property_id } = req.params;

    try {
        const bookings = await fetchBookings(property_id);
        res.status(200).send(bookings);
    } catch(err){
        next(err);
    };
};