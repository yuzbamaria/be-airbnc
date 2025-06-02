const express = require("express");
const favouritesRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { getFavourites, deleteFavourite } = require("../controllers/favouriteController"); 

favouritesRouter
    .get("/", getFavourites);


favouritesRouter
    .delete("/:id", authMiddleware, deleteFavourite);

module.exports = favouritesRouter;
