const express = require("express");
const app = express();
const { handlePathNotFound } = require("./errors/handleErrors");
const { getProperties } = require("./controllers/propertiesController");

app.get("/api/properties", getProperties);

app.all("/*", handlePathNotFound);

module.exports = app;