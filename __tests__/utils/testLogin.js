const request = require("supertest");
const app = require("../../app");

module.exports = async function getTestToken() {
    const res = await request(app)
        .post("/api/login")
        .send({ email: "bob@example.com", password: "000111" });
    return res.body.token;
};