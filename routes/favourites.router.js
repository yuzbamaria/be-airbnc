const express = require("express");
const favouritesRouter = express.Router();

const { getFavourites, deleteFavourite } = require("../controllers/favouriteController"); 

favouritesRouter
    .get("/", getFavourites);

favouritesRouter
    .delete("/:id", deleteFavourite);

module.exports = favouritesRouter;
