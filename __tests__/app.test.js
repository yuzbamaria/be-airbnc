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
    test("path not found", async() => {
        const { body: { msg } } = await request(app)
            .get("/invalid/endpoint")
            .expect(404);
        expect(msg).toBe("Path not found.");
    });
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
        test("responds with properties objects sorted by cost_per_night, if it's provided in the query", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?sort=cost_per_night");
            expect(properties).toBeSortedBy("price_per_night", { descending: true });
        });
    
        // SAD PATH
        test("400 - bad request if invalid query sort option is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?sort=cott_per_night")
                .expect(400);
            console.log(msg)
            expect(msg).toBe("Bad request - invalid sort option.");
        });
    });
});