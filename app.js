const express = require("express");
const app = express();

app.get("/api/properties", getProperties);

module.exports = app;