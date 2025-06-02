const express = require("express");
const reviewsRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { deleteReview } = require("../controllers/reviewsController");

reviewsRouter
    .delete("/:id", authMiddleware, deleteReview);

module.exports = reviewsRouter;
