const express = require("express");
const app = express();
const apiRouter = require("./routes/api.router");
const cors = require('cors');

const { 
    handlePathNotFound, 
    handleCustomError, 
    handleDbDataTypeErrors, 
    handleForeignKeyVioletions 
} = require("./errors/handleErrors");

app.use(cors());

app.use(express.json());
app.use(express.static('public'));
app.use("/api", apiRouter);

app.all("/*", handlePathNotFound); // catch-all

app.use(handleDbDataTypeErrors);
app.use(handleForeignKeyVioletions);
app.use(handleCustomError); // generic error handler

module.exports = app;