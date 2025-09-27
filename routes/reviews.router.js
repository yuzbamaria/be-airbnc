const express = require("express");
const reviewsRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

const { deleteReview } = require("../controllers/reviewsController");

reviewsRouter.post("/", authMiddleware, checkRole("guest"), createReview);
reviewsRouter.delete("/:id", authMiddleware, checkRole("guest"), deleteReview);

module.exports = reviewsRouter;
