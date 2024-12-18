const express = require("express");
const propertiesRouter = express.Router();

const { getProperties, getProperty } = require("../controllers/propertiesController");
const { createFavouriteById } = require("../controllers/favouriteController");
const { getReviews, addReview } = require("../controllers/reviewsController");
const { getBookings, addBooking } = require("../controllers/bookingsController");

propertiesRouter
    .get("/", getProperties);

propertiesRouter
    .post("/:id/favourite", createFavouriteById);

propertiesRouter
    .get("/:id", getProperty);

propertiesRouter
    .route("/:id/reviews")
    .get(getReviews)
    .post(addReview);

propertiesRouter
    .get("/:id/bookings", getBookings);

propertiesRouter
    .post("/:id/booking", addBooking); 

module.exports = propertiesRouter;