const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test/index");
const seed = require("../db/seed");
require('jest-sorted');

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    return db.end();
});

describe("app", () => {
    describe("/api/properties", () => {
        // HAPPY PATH
        test("200 - responds with an array of objects and props: property_id, property_name, location, price_per_night, host(<full name>)", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties")
                expect(200);
            expect(Array.isArray(properties)).toBe(true);
            expect(properties.length).toBeGreaterThan(0);
            properties.forEach((property) => {
                expect(property).toHaveProperty("property_id");
                expect(property).toHaveProperty("property_name");
                expect(property).toHaveProperty("location");
                expect(property).toHaveProperty("price_per_night");
                expect(property).toHaveProperty("host");
            });
        });
    });
});