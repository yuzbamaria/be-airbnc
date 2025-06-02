const express = require("express");
const bookingsRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { 
    deleteBooking, 
    updateBooking 
} = require("../controllers/bookingsController");

bookingsRouter.use(authMiddleware);

bookingsRouter
    .route("/:id")
    .delete(deleteBooking)
    .patch(updateBooking);

module.exports = bookingsRouter;