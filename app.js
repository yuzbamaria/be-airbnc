const express = require("express");
const app = express();

const getProperties = require("./controllers/propertiesController");

app.get("/api/properties", getProperties);

module.exports = app;