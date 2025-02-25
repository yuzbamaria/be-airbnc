const app = require("./app");

const { PORT = 10000 } = process.env;

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});