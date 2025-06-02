const express = require("express");
const usersRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { 
    getUser, 
    updateUser, 
    getUserBookings 
} = require("../controllers/usersController");

usersRouter.use(authMiddleware);

usersRouter
    .route("/:id")
    .get(getUser)
    .patch(updateUser);

usersRouter
    .get("/:id/bookings", getUserBookings);

module.exports = usersRouter;