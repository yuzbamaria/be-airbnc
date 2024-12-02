const express = require("express");
const app = express();
const { handlePathNotFound } = require("./errors/handleErrors");
const { getProperties } = require("./controllers/propertiesController");
const { handleInvalidEndpoints } = require("./errors/handleErrors");

app.get("/api/properties", getProperties);

app.all("/*", handlePathNotFound);

app.use(handleInvalidEndpoints);

module.exports = app;