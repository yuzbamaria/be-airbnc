const express = require("express");
const app = express();
const { 
    handlePathNotFound, 
    handleCustomError, 
    handleDbDataTypeErrors, 
    handleForeignKeyVioletions 
} = require("./errors/handleErrors");
const { getProperties, getProperty } = require("./controllers/propertiesController");
const { createFavouriteById, deleteFavourite } = require("./controllers/favouriteController");
const { getReviews, addReview, deleteReview } = require("./controllers/reviewsController");
const { getUser, updateUser } = require("./controllers/usersController");
const { getBookings, addBooking, deleteBooking, updateBooking } = require("./controllers/bookingsController");

app.use(express.json());

app.get("/api/properties", getProperties);
app.post("/api/properties/:id/favourite", createFavouriteById);
app.get("/api/properties/:id", getProperty);
app.get("/api/properties/:id/reviews", getReviews);
app.post("/api/properties/:id/reviews", addReview);
app.delete("/api/reviews/:id", deleteReview);

app.get("/api/properties/:id/bookings", getBookings);
app.post("/api/properties/:id/booking", addBooking); 
app.delete("/api/bookings/:id", deleteBooking);
app.patch("/api/bookings/:id", updateBooking);



app.delete("/api/favourites/:id", deleteFavourite);

app.get("/api/users/:id", getUser);
app.patch("/api/users/:id", updateUser);


app.all("/*", handlePathNotFound); // catch-all

app.use(handleDbDataTypeErrors);
app.use(handleForeignKeyVioletions);
app.use(handleCustomError); // generic error handler

module.exports = app;