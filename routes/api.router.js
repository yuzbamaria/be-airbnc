const express = require("express");
const apiRouter = express.Router();
const authMiddleware = require("./middleware/authMiddleware");

const propertiesRouter = require("./properties.router");
const reviewsRouter = require("./reviews.router");
const bookingsRouter = require("./bookings.router");
const favouritesRouter = require("./favourites.router");
const usersRouter = require("./users.router");
const signupRouter = require("./signup.router");
const loginRouter = require("./login.router");

// Public routes
apiRouter.use("/signup", signupRouter);
apiRouter.use("/login", loginRouter);

// Protected routes
apiRouter.use(authMiddleware); // this runs before the routes below

apiRouter.use("/properties", propertiesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/favourites", favouritesRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;