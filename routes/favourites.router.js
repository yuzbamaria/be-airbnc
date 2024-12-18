const express = require("express");
const favouritesRouter = express.Router();

const { deleteFavourite } = require("../controllers/favouriteController"); 

favouritesRouter
    .delete("/:id", deleteFavourite);

module.exports = favouritesRouter;
