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

describe.only("app", () => {
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
        test("responds with properties objects sorted by cost_per_night, descending order by default, if it's provided in the query", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?sort=cost_per_night");
            expect(properties).toBeSortedBy("price_per_night", { descending: true });
        });
        test("responds with properties objects sorted by popularity, ascending order if provided, otherwise descending by default", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?sort=popularity&order=asc");
            const dbTest = await db.query(`
                SELECT 
                    properties.property_id, 
                    properties.name, 
                    properties.location, 
                    properties.price_per_night::int AS cost_per_night, 
                    properties.host_id, 
                    users.first_name, 
                    users.surname, 
                    COUNT(favourites.favourite_id) as popularity
                FROM properties
                JOIN users ON properties.host_id = users.user_id
                LEFT JOIN favourites ON properties.property_id = favourites.property_id
                GROUP BY properties.property_id, users.first_name, users.surname
                ORDER BY popularity ASC;
            `);
            const dbTestIds = dbTest.rows.map((row) => row.property_id);
            const originalResIds = properties.map((property) => property.property_id);
            expect(dbTestIds).toEqual(originalResIds);
        });
        test("responds with selected properties objects according to the passed host_id", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?host=1");
            properties.map((property) => {
                expect(property.host).toBe('Alice Johnson');
            });
        });
    
        // SAD PATH
        test("404 - resource not found if valid, but non-existant sort is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?sort=cott_per_night")
                .expect(404);
            expect(msg).toBe("Resource not found.");
        });
        test("400 - bad request if invalid host endpoint is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?host=cat")
                .expect(400);
            expect(msg).toBe("Bad request - invalid host id.");
        });
    });
});