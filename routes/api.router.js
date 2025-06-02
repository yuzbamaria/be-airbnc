const express = require("express");
const apiRouter = express.Router();

const propertiesRouter = require("./properties.router");
const reviewsRouter = require("./reviews.router");
const bookingsRouter = require("./bookings.router");
const favouritesRouter = require("./favourites.router");
const usersRouter = require("./users.router");
const signupRouter = require("./signup.router");
const loginRouter = require("./login.router");

apiRouter.use("/signup", signupRouter);
apiRouter.use("/login", loginRouter);
apiRouter.use("/properties", propertiesRouter);
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/bookings", bookingsRouter);
apiRouter.use("/favourites", favouritesRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;