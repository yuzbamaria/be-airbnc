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
    describe("GET /api/properties", () => {
        
        // -------> HAPPY PATH <--------
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
        test("'sort=cost_per_night' - responds with properties objects sorted by cost_per_night, descending order by default, if it's provided in the query", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?sort=cost_per_night");
            expect(properties).toBeSortedBy("price_per_night", { descending: true });
        });
        test("'sort=popularity' - responds with properties objects sorted by popularity, ascending order if provided, otherwise descending by default", async() => {
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
        test("'host=<id>' - responds with selected properties objects according to the passed host_id", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?host=1");
            properties.map((property) => {
                expect(property.host).toBe('Alice Johnson');
            });
        });
        test("'maxprice=<max cost per night>' - responds with selected properties objects with price_per_night less than maxprice", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?maxprice=200");
            properties.forEach((property) => {
                expect(property.price_per_night).toBeLessThanOrEqual(200);
            });
        });
        test("'host=<id>&maxprice=<max cost per night>' - responds with selected properties objects as to the passed filters", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?host=1&maxprice=150");
            properties.forEach((property) => {
                expect(property.price_per_night).toBeLessThanOrEqual(150);
                expect(property.host).toBe('Alice Johnson');
            });
        });
        test("'?minprice=<min cost per night>' - responds with selected properties objects with price_per_night more than minprice", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?minprice=150");
            properties.forEach((property) => {
                expect(property.price_per_night).toBeGreaterThanOrEqual(150);
            });
        });

        // -------> SAD PATH <--------
        test("sort, 404 - resource not found if valid, but non-existant sort is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?sort=cott_per_night")
                .expect(404);
            expect(msg).toBe("Path not found.");
        });
        test("host, 400 - bad request if invalid host endpoint is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?host=cat")
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("host, 404 - resource not found if valid, but non-existant host passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?host=2222222")
                .expect(404);
            expect(msg).toBe("Resource not found.");
        });
        test("maxprice, 404 - resource not found if valid, but non-existant host passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?maxprice=1")
                .expect(404);
            expect(msg).toBe("Resource not found.");
        });
        test("maxprice, 400 - bad request if invalid maxprice endpoint is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?maxprice=dog")
                .expect(400);
            expect(msg).toBe("Bad request."); // <----- BLOCKER
        });
        test("minprice, 404 - resource not found if valid, but non-existant host passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?minprice=1000000")
                .expect(404);
            expect(msg).toBe("Resource not found.");
        });
        test("minprice, 400 - bad request if invalid minprice endpoint is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?minprice=dog")
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
    });
    describe("POST /api/properties/:id/favourite", () => {

        // -------> HAPPY PATH <--------
        test("201 - returns an object", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/favourite")
                .send({guest_id: 2})
                .expect(201);
            expect(typeof body).toBe("object");
        });
        test("responds with correct favourite object props: msg, favourite_id", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/favourite")
                .send({guest_id: 2});
            expect(body).toHaveProperty("msg");
            expect(body).toHaveProperty("favourite_id");
        });
        test("inserts a new favourite object in db", async() => {
            const favourite = {guest_id: 2}
            await request(app)
                .post("/api/properties/3/favourite")
                .send(favourite);
            const { rows } = await db.query(`
                SELECT * FROM favourites
                WHERE guest_id = $1`, [favourite.guest_id]);
            expect(rows[0]).toEqual(expect.objectContaining(favourite));
        });

        // -------> SAD PATH <--------
        // later - if no property_id is passed 
        // later - if no user_id is passed 
        test("400 - bad request, when guest_id is invalid data type", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3/favourite")
                .send({guest_id: "meow"})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - guest not found when the role of id belongs to other, host, role", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/favourite")
                .send({guest_id: 3})
                .expect(404);
            // console.log(body.msg)
            expect(body.msg).toBe("Guest not found")
        });
        test("400 - if invalid data type of property id query is passed in url", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/khgksydtfiys/favourite")
                .send({guest_id: 4})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - if valid, but non-existant property id query is passed in url", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3000/favourite")
                .send({guest_id: 2})
                .expect(404);
            expect(msg).toBe("Resource doesn't exist.");
        });
        test("409 - if guest_id has already favourited the property_id", async() => {
            await db.query(`INSERT INTO favourites (guest_id, property_id) VALUES (2, 3);`);
            
            const { body: { msg } } = await request(app)
                .post("/api/properties/3/favourite")
                .send({guest_id: 2})
                .expect(409);
            expect(msg).toBe("You've already favourited this property.")
        });
    });
    describe("DELETE /api/favourites/:id", () => {

        // -------> HAPPY PATH <--------
        test("204 - successfully deletes a row with a status 204 No Content", async() => {
            await request(app)
                .delete("/api/favourites/2")
                .expect(204);
        });
        test("responds with no body", async() => {
            const result = await request(app)
                .delete("/api/favourites/2");
            expect(result.body).toEqual({});
        });

        // -------> SAD PATH <--------
        test("404 - Favourite not found if non existent id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/favourites/12")
                .expect(404);
            expect(msg).toBe("Favourite not found.");
        });
        test("400 - Bad request if invalid id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/favourites/bkugsdf")
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
    });
});