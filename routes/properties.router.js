const express = require("express");
const propertiesRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

const { getProperties, getProperty, getFavouriteByUser } = require("../controllers/propertiesController");
const { createFavouriteById } = require("../controllers/favouriteController");
const { getReviews, addReview } = require("../controllers/reviewsController");
const { getBookings, addBooking } = require("../controllers/bookingsController");

propertiesRouter.get("/", getProperties);
propertiesRouter.get("/:id", getProperty);
propertiesRouter.get("/:id/reviews", getReviews);


propertiesRouter
    .post("/:id/favourite", authMiddleware, checkRole("guest"), createFavouriteById);

propertiesRouter
    .get("/:id/favourite", authMiddleware, checkRole("guest"), getFavouriteByUser);

propertiesRouter.post("/:id/reviews", authMiddleware, checkRole("guest"), addReview);

propertiesRouter
    .get("/:id/bookings", authMiddleware, getBookings);

propertiesRouter
    .post("/:id/booking", authMiddleware, checkRole("guest"), addBooking); 

module.exports = propertiesRouter;