const express = require("express");
const signupRouter = express.Router();

const { getNewUser } = require("../controllers/signupController");

signupRouter
    .route("/")
    .post(getNewUser);

module.exports = signupRouter;
