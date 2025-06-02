const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test/index");
const seed = require("../db/seed");
require('jest-sorted');
require('jest-extended');

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    return db.end();
});

describe("app", () => {
    test("path not found", async() => {
        const { body: { msg } } = await request(app)
            .get("/invalid/endpoint")
            .expect(404);
        expect(msg).toBe("Path not found.");
    });
});