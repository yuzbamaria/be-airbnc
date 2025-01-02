// const fs = require("fs");
// const path = require("path");

// exports.getAllEndpoints = async(req, res, next) => {
//     try {
//         const filePath = path.join(__dirname, "../allEndpoints.html");
//         const data = await fs.readFile(filePath, "utf-8");
//         res.status(200).send(data);
//     } catch(err) {
//         console.log(err);
//     };
// };