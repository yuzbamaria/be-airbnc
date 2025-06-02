const express = require("express");
const favouritesRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

const { getFavourites, deleteFavourite } = require("../controllers/favouriteController"); 

favouritesRouter
    .get("/", getFavourites);

favouritesRouter
    .delete("/:id", authMiddleware, checkRole("guest"), deleteFavourite);

module.exports = favouritesRouter;
