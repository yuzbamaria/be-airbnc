const express = require("express");
const favouritesRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

const { getFavourites, deleteFavourite } = require("../controllers/favouriteController"); 

favouritesRouter.use(authMiddleware);

favouritesRouter
    .get("/", getFavourites);

favouritesRouter
    .delete("/:id", checkRole("guest"), deleteFavourite);

module.exports = favouritesRouter;
