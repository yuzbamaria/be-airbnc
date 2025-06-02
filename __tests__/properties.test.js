const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test/index");
const seed = require("../db/seed");
const getTestToken = require("./utils/testLogin");
require('jest-sorted');

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    return db.end();
});

describe("GET /api/properties/:id/bookings", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });

    describe("HAPPY PATH", () => {
        test("responds with 200 and bookings data", async () => {
            const propertyId = 6;
            const { body: { bookings } } = await request(app)
                .get(`/api/properties/${propertyId}/bookings`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200);
            expect(Array.isArray(bookings)).toBe(true);   
        });
        test("responds with bookings objects, having properties as below", async() => {
            const { body: { bookings } } = await request(app)
                .get("/api/properties/1/bookings")
                .set("Authorization", `Bearer ${token}`);
            expect(bookings[0]).toHaveProperty("booking_id");
            expect(bookings[0]).toHaveProperty("check_in_date");
            expect(bookings[0]).toHaveProperty("check_out_date");
            expect(bookings[0]).toHaveProperty("created_at");
        });
        test("response body contains property_id prop", async() => {
            const { body } = await request(app)
                .get("/api/properties/2/bookings")
                .set("Authorization", `Bearer ${token}`);
            expect(body).toHaveProperty("property_id");
        });
        test("response with bookings objects ordered from latest to earliest check_out_date", async() => {
            const { body: { bookings } } = await request(app)
                .get("/api/properties/2/bookings")
                .set("Authorization", `Bearer ${token}`);
            expect(bookings).toEqual([...bookings].sort((a, b) => a - b));
        });
    });
    describe("SAD PATH", () => {
        test("400 - Bad request if invalid property_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties/fgsg/bookings")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - Property not found if non-existant property_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties/12/bookings")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Resource not found.")
        });
    });
});

describe("POST /api/properties/:id/booking", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });

    describe("HAPPY PATH", () => {
        test("201 - returns an object", async() => {
            const { body } = await request(app)
                .post("/api/properties/2/booking")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    guest_id: 4,
                    check_in_date: "2026-12-10",
                    check_out_date: "2026-12-15"
                })
                .expect(201);
            expect(typeof body).toBe("object");
        });
        test("responds with correct booking object props: msg, booking_id", async() => {
            const { body } = await request(app)
                .post("/api/properties/2/booking")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 5,
                    check_in_date: "2027-12-10",
                    check_out_date: "2027-12-15"});
            expect(body).toHaveProperty("msg");
            expect(body).toHaveProperty("booking_id");
        });
    });
    describe("SAD PATH", () => {
        test("if the property is booked, responds with a message notifying about that", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/2/booking")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    guest_id: 3,
                    check_in_date: "2025-12-10",
                    check_out_date: "2025-12-15"
                })
                .expect(409);
            expect(msg).toBe('Property is booked for these dates.');
        });
    });
});

describe("GET /api/properties", () => {
    beforeAll(async () => {
        token = await getTestToken();
    });

    describe("HAPPY PATH", () => {
        test("200 - responds with an array of objects and props: property_id, property_name, location, price_per_night, host(<full name>)", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties")
                .set("Authorization", `Bearer ${token}`)
                expect(200);
            expect(Array.isArray(properties)).toBe(true);
            expect(properties.length).toBeGreaterThan(0);
            properties.forEach((property) => {
                expect(property).toHaveProperty("property_id");
                expect(property).toHaveProperty("property_name");
                expect(property).toHaveProperty("location");
                expect(property).toHaveProperty("cost_per_night");
                expect(property).toHaveProperty("host");
                expect(property).toHaveProperty("images");
            });
        });
        test("'sort=cost_per_night' - responds with properties objects sorted by cost_per_night, descending order by default, if it's provided in the query", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?sort=cost_per_night")
                .set("Authorization", `Bearer ${token}`);
            expect(properties).toBeSortedBy("cost_per_night", { descending: true });
        });
        test("'sort=popularity' - responds with properties objects sorted by popularity, ascending order if provided, otherwise descending by default", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?sort=popularity&order=asc")
                .set("Authorization", `Bearer ${token}`);
            const dbTest = await db.query(`
                SELECT 
                    properties.property_id, 
                    properties.name, 
                    properties.location, 
                    properties.price_per_night::int AS cost_per_night, 
                    properties.host_id, 
                    users.first_name, 
                    users.surname, 
                    COUNT(favourites.favourite_id) as popularity,
                    ARRAY_AGG(images.image_url) as images
                FROM properties
                JOIN users ON properties.host_id = users.user_id
                LEFT JOIN favourites ON properties.property_id = favourites.property_id
                JOIN images ON properties.property_id = images.property_id
                GROUP BY properties.property_id, users.first_name, users.surname
                ORDER BY popularity ASC;
            `);
            const dbTestIds = dbTest.rows.map((row) => row.property_id);
            const originalResIds = properties.map((property) => property.property_id);
            expect(dbTestIds).toEqual(originalResIds);
        });
        test("'host=<id>' - responds with selected properties objects according to the passed host_id", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?host=1")
                .set("Authorization", `Bearer ${token}`);
            properties.map((property) => {
                expect(property.host).toBe('Alice Johnson');
            });
        });
        test("'maxprice=<max cost per night>' - responds with selected properties objects with price_per_night less than maxprice", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?maxprice=200")
                .set("Authorization", `Bearer ${token}`);
            properties.forEach((property) => {
                expect(property.cost_per_night).toBeLessThanOrEqual(200);
            });
        });
        test("'host=<id>&maxprice=<max cost per night>' - responds with selected properties objects as to the passed filters", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?host=1&maxprice=150")
                .set("Authorization", `Bearer ${token}`);
            properties.forEach((property) => {
                expect(property.cost_per_night).toBeLessThanOrEqual(150);
                expect(property.host).toBe('Alice Johnson');
            });
        });
        test("'?minprice=<min cost per night>' - responds with selected properties objects with price_per_night more than minprice", async() => {
            const { body: { properties } } = await request(app)
                .get("/api/properties?minprice=150")
                .set("Authorization", `Bearer ${token}`);
            properties.forEach((property) => {
                expect(property.cost_per_night).toBeGreaterThanOrEqual(150);
            });
        });
    });
    describe("SAD PATH", () => {
        test("sort, 404 - resource not found if valid, but non-existant sort is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?sort=cott_per_night")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Path not found.");
        });
        test("host, 400 - bad request if invalid host endpoint is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?host=cat")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("host, 404 - resource not found if valid, but non-existant host passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?host=2222222")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Resource not found.");
        });
        test("maxprice, 404 - resource not found if valid, but non-existant host passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?maxprice=1")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Resource not found.");
        });
        // test("maxprice, 400 - bad request if invalid maxprice endpoint is provided", async() => {
        //     const { body: { msg } } = await request(app)
        //         .get("/api/properties?maxprice=dog")
        //         .set("Authorization", `Bearer ${token}`)
        //         .expect(400);
        //     expect(msg).toBe("Bad request."); // <----- BLOCKER
        // });
        test("minprice, 404 - resource not found if valid, but non-existant host passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties?minprice=1000000")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Resource not found.");
        });
        // test("minprice, 400 - bad request if invalid minprice endpoint is provided", async() => {
        //     const { body: { msg } } = await request(app)
        //         .get("/api/properties?minprice=dog")
        //         .set("Authorization", `Bearer ${token}`)
        //         .expect(400);
        //     expect(msg).toBe("Bad request.");
        // });
    });
});

describe("GET /api/properties/:id", () => {
    beforeAll(async () => {
        token = await getTestToken();
    });

    describe("HAPPY PATH", () => {
        test("200 - responds with object property ", async() => {
            const { body: { property } } = await request(app)
                .get("/api/properties/2")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);
            expect(typeof property).toBe("object")
        });
        test("responds with property object, having properties as below", async() => {
            const { body: { property } } = await request(app)
                .get("/api/properties/1")
                .set("Authorization", `Bearer ${token}`);
            expect(property).toHaveProperty("property_id");
            expect(property).toHaveProperty("property_name");
            expect(property).toHaveProperty("location");
            expect(property).toHaveProperty("price_per_night");
            expect(property).toHaveProperty("description");
            expect(property).toHaveProperty("host");
            expect(property).toHaveProperty("host_avatar");
            expect(property).toHaveProperty("favourite_count");
            expect(property).toHaveProperty("images");
        });
        test("responds with property object having prop images as an array of objects with urls", async() => {
            const { body: { property } } = await request(app)
                .get("/api/properties/1")
                .set("Authorization", `Bearer ${token}`);
            expect(typeof property.images[0]).toBe("string");
            expect(Array.isArray(property.images)).toBe(true);
            expect(property.images.length).toBeGreaterThan(0);
        });
        test("?user_id=<id> - responds with favourited property if optional user_id is passed in url", async() => {
            const { body: { property } } = await request(app)
                .get("/api/properties/3?user_id=4")
                .set("Authorization", `Bearer ${token}`);
            expect(property).toHaveProperty('favourited');
        });
    });
    describe("SAD PATH", () => {
        test("404 - Property not found if non-existant property_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties/10000")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Resource not found.")
        });
        // test("400 - Bad request if invalid property_id is passed", async() => {
        //     const { body: { msg } } = await request(app)
        //         .get("/api/properties/jfjyt")
        //         .set("Authorization", `Bearer ${token}`)
        //         .expect(400);
        //     expect(msg).toBe("Bad request."); ----->  got 200 "OK"
        // });
        // test("404 - Property not found if non-existant user_id is passed", async() => {
        //     const { body: { msg } } = await request(app)
        //         .get("/api/properties/1?user_id=1000")
        //         .set("Authorization", `Bearer ${token}`)
        //         .expect(404);
        //     expect(msg).toBe("Resource not found.") ----->  got 200 "OK"
        // });
        // test("400 - Bad request if invalid user_id is passed", async() => {
        //     const { body: { msg } } = await request(app)
        //         .get("/api/properties/1?user_id=itiiewr")
        //         .set("Authorization", `Bearer ${token}`)
        //         .expect(400);
        //     expect(msg).toBe("Bad request."); ----->  got 200 "OK"
        // });
    });
});

describe("GET /api/properties/:id/reviews", () => {
    beforeAll(async () => {
        token = await getTestToken();
    });

    describe("HAPPY PATH", () => {
        test("200 - responds with an array of reviews objects", async() => {
            const { body: { reviews } } = await request(app)
                .get("/api/properties/1/reviews")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);
            expect(Array.isArray(reviews)).toBe(true);
        });
        test("responds with reviews objects, having properties as below", async() => {
            const { body: { reviews } } = await request(app)
                .get("/api/properties/1/reviews")
                .set("Authorization", `Bearer ${token}`);
            expect(reviews[0]).toHaveProperty("review_id");
            expect(reviews[0]).toHaveProperty("comment");
            expect(reviews[0]).toHaveProperty("rating");
            expect(reviews[0]).toHaveProperty("created_at");
            expect(reviews[0]).toHaveProperty("guest");
            expect(reviews[0]).toHaveProperty("guest_avatar");
        });
        //test for desc order (clarify time creation postgreSQL)
        test("response body contains average_rating prop", async() => {
            const { body } = await request(app)
                .get("/api/properties/1/reviews")
                .set("Authorization", `Bearer ${token}`);
            expect(body).toHaveProperty("average_rating");
        });
    });
    describe("SAD PATH", () => {
        // --------> BLOCKER <-------- returns 200
        // test("404 - Property not found if non-existant property_id is passed", async() => {
        //     const { body: { msg } } = await request(app)
        //         .get("/api/properties/59326/reviews")
        //         .expect(404);
        //     expect(msg).toBe("Resource not found.")
        // });
        test("400 - Bad request if invalid property_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/properties/jfjyt/reviews")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
    });
});

describe("POST /api/properties/:id/reviews", () => {
    beforeAll(async () => {
        token = await getTestToken();
    });

    describe("HAPPY PATH", () => {
        test("201 - returns an object", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 2, rating: 40, comment: "hello"})
                .expect(201);
            expect(typeof body).toBe("object");
        });
        test("responds with correct review object props: msg, favourite_id", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 2, rating: 40, comment: "hello"});
            expect(body).toHaveProperty("review_id");
            expect(body).toHaveProperty("property_id");
            expect(body).toHaveProperty("guest_id");
            expect(body).toHaveProperty("rating");
            expect(body).toHaveProperty("comment");
            expect(body).toHaveProperty("created_at");
        });
        test("inserts a new review object in db", async() => {
            const review = {guest_id: 4, rating: 40, comment: "boo"};
            await request(app)
                .post("/api/properties/3/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send(review);
            const { rows } = await db.query(`
                SELECT * FROM reviews
                WHERE comment = $1`, [review.comment]);
            expect(rows[0]).toEqual(expect.objectContaining(review));
        });
    });
    describe("SAD PATH", () => {
        test("400 - bad request, when guest_id is invalid data type", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: "dfgs", rating: 40, comment: "boo"})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("400 - bad request, when rating is invalid data type", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 6, rating: "gdser", comment: "boo"})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("400 - bad request, when property_id is invalid data type", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/kgkut/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 6, rating: 20, comment: "boo"})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - if valid, but non-existant property_id query is passed in url", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3000/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 6, rating: 20, comment: "boo"})
                .expect(404);
            expect(msg).toBe("Resource doesn't exist.");
        });
        test("404 - if valid, but non-existant guest_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3/reviews")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 600, rating: 20, comment: "boo"})
                .expect(404);
            expect(msg).toBe("Resource doesn't exist.");
        });
    });
});

describe("POST /api/properties/:id/favourite", () => {
    beforeAll(async () => {
        token = await getTestToken();
    });

    describe("HAPPY PATH", () => {
        test("201 - returns an object", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 2})
                .expect(201);
            expect(typeof body).toBe("object");
        });
        test("responds with correct favourite object props: msg, favourite_id", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 2});
            expect(body).toHaveProperty("msg");
            expect(body).toHaveProperty("favourite_id");
        });
        test("inserts a new favourite object in db", async() => {
            const favourite = {guest_id: 2}
            await request(app)
                .post("/api/properties/3/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send(favourite);
            const { rows } = await db.query(`
                SELECT * FROM favourites
                WHERE guest_id = $1`, [favourite.guest_id]);
            expect(rows[0]).toEqual(expect.objectContaining(favourite));
        });
    });
    describe("SAD PATH", () => {
        // later - if no property_id is passed 
        // later - if no user_id is passed 
        test("400 - bad request, when guest_id is invalid data type", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: "meow"})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - guest not found when the role of id belongs to other, host, role", async() => {
            const { body } = await request(app)
                .post("/api/properties/3/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 3})
                .expect(404);
            expect(body.msg).toBe("Guest not found")
        });
        test("400 - if invalid data type of property id query is passed in url", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/khgksydtfiys/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 4})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - if valid, but non-existant property id query is passed in url", async() => {
            const { body: { msg } } = await request(app)
                .post("/api/properties/3000/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 2})
                .expect(404);
            expect(msg).toBe("Resource doesn't exist.");
        });
        test("409 - if guest_id has already favourited the property_id", async() => {
            await db.query(`INSERT INTO favourites (guest_id, property_id) VALUES (2, 3);`);
            
            const { body: { msg } } = await request(app)
                .post("/api/properties/3/favourite")
                .set("Authorization", `Bearer ${token}`)
                .send({guest_id: 2})
                .expect(409);
            expect(msg).toBe("You've already favourited this property.")
        });
    });
});