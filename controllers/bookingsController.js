const { fetchBookings, postBooking, removeBooking } = require("../models/bookingsModel");

exports.getBookings = async(req, res, next) => {
    const { id: property_id } = req.params;
    try {
        const bookings = await fetchBookings(property_id);
        res.status(200).send(bookings);
    } catch(err){
        next(err);
    };
};

exports.addBooking = async(req, res, next) => {
    const { id: property_id } = req.params;
    const { guest_id, check_in_date, check_out_date } = req.body;
    try {
        const booking = await postBooking(property_id, guest_id, check_in_date, check_out_date);
        res.status(201).send(booking);
    } catch(err){
        next(err);
    };
};

exports.deleteBooking = async(req, res, next) => {
    const { id: booking_id } = req.params;
    try {
        await removeBooking(booking_id);
        res.status(204).send();
    } catch(err) {
        next(err);
    };
};