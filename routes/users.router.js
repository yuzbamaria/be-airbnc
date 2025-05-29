const express = require("express");
const usersRouter = express.Router();

const { 
    getUser, 
    updateUser, 
    getUserBookings 
} = require("../controllers/usersController");

usersRouter
    .route("/:id")
    .get(getUser)
    .patch(updateUser);

usersRouter
    .get("/:id/bookings", getUserBookings);



module.exports = usersRouter;