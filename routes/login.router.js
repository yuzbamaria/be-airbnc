const express = require("express");
const loginRouter = express.Router();

const { getRegisteredUser } = require("../controllers/loginController");

loginRouter
    .route("/")
    .post(getRegisteredUser);

module.exports = loginRouter;