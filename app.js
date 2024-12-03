const express = require("express");
const app = express();
const { handlePathNotFound, handleCustomError } = require("./errors/handleErrors");
const { getProperties } = require("./controllers/propertiesController");

app.get("/api/properties", getProperties);

app.all("/*", handlePathNotFound);

app.use(handleCustomError);

module.exports = app;