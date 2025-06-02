const express = require("express");
const propertiesRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { getProperties, getProperty, getFavouriteByUser } = require("../controllers/propertiesController");
const { createFavouriteById } = require("../controllers/favouriteController");
const { getReviews, addReview } = require("../controllers/reviewsController");
const { getBookings, addBooking } = require("../controllers/bookingsController");

propertiesRouter.get("/", getProperties);
propertiesRouter.get("/:id", getProperty);
propertiesRouter.get("/:id/reviews", getReviews);

propertiesRouter
    .post("/:id/favourite", authMiddleware, createFavouriteById);

propertiesRouter
    .get("/:id/favourite", authMiddleware, getFavouriteByUser);

propertiesRouter.post("/:id/reviews", authMiddleware, addReview);

propertiesRouter
    .get("/:id/bookings", authMiddleware, getBookings);

propertiesRouter
    .post("/:id/booking", authMiddleware, addBooking); 

module.exports = propertiesRouter;