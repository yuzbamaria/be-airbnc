const express = require("express");
const app = express();
const { handlePathNotFound, handleCustomError, handleDbDataTypeErrors } = require("./errors/handleErrors");
const { getProperties } = require("./controllers/propertiesController");
const { createFavouriteById } = require("./controllers/createFavouriteController");

app.use(express.json());

app.get("/api/properties", getProperties);
app.post("/api/properties/:id/favourite", createFavouriteById);
app.all("/*", handlePathNotFound); // catch-all

app.use(handleDbDataTypeErrors);
app.use(handleCustomError); // generic error handler

module.exports = app;