const express = require("express");
const reviewsRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");

const { addReview, deleteReview } = require("../controllers/reviewsController");

reviewsRouter.post("/", authMiddleware, checkRole("guest"), addReview);
reviewsRouter.delete("/:id", authMiddleware, checkRole("guest"), deleteReview);

module.exports = reviewsRouter;
