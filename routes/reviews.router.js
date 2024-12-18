const express = require("express");
const reviewsRouter = express.Router();

const { deleteReview } = require("../controllers/reviewsController");

reviewsRouter
    .delete("/:id", deleteReview);

module.exports = reviewsRouter;
