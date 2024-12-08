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
const {  getReviews } = require("./controllers/reviewsController");

app.use(express.json());

app.get("/api/properties", getProperties);
app.post("/api/properties/:id/favourite", createFavouriteById);
app.delete("/api/favourites/:id", deleteFavourite);
app.get("/api/properties/:id", getProperty);
app.get("/api/properties/:id/reviews", getReviews);
app.all("/*", handlePathNotFound); // catch-all

app.use(handleDbDataTypeErrors);
app.use(handleForeignKeyVioletions);
app.use(handleCustomError); // generic error handler

module.exports = app;