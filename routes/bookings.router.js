const express = require("express");
const bookingsRouter = express.Router();

const { 
    deleteBooking, 
    updateBooking 
} = require("../controllers/bookingsController");

bookingsRouter
    .route("/:id")
    .delete(deleteBooking)
    .patch(updateBooking);

module.exports = bookingsRouter;