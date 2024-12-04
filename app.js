const express = require("express");
const app = express();
const { handlePathNotFound, handleCustomError, handleDbDataTypeErrors } = require("./errors/handleErrors");
const { getProperties } = require("./controllers/propertiesController");

app.get("/api/properties", getProperties);
app.all("/*", handlePathNotFound); // catch-all

app.use(handleDbDataTypeErrors);
app.use(handleCustomError); // generic error handler

module.exports = app;