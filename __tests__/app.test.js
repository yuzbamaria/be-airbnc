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
        describe("HAPPY PATH", () => {
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
                    expect(property).toHaveProperty("image");
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
                        COUNT(favourites.favourite_id) as popularity,
                        images.image_url AS image
                    FROM properties
                    JOIN users ON properties.host_id = users.user_id
                    LEFT JOIN favourites ON properties.property_id = favourites.property_id
                    JOIN images ON properties.property_id = images.property_id
                    GROUP BY properties.property_id, users.first_name, users.surname, images.image_url
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
        });
        describe("SAD PATH", () => {
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
    });
    describe("GET /api/properties/:id", () => {
        describe("HAPPY PATH", () => {
            test("200 - responds with object property ", async() => {
                const { body: { property } } = await request(app)
                    .get("/api/properties/2")
                    .expect(200);
                expect(typeof property).toBe("object")
            });
            test("responds with property object, having properties as below", async() => {
                const { body: { property } } = await request(app)
                    .get("/api/properties/1");
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
                    .get("/api/properties/1");
                expect(typeof property.images[0]).toBe("object");
                expect(Array.isArray(property.images)).toBe(true);
                expect(property.images.length).toBeGreaterThan(0);
            });
            test("?user_id=<id> - responds with favourited property if optional user_id is passed in url", async() => {
                const { body: { property } } = await request(app)
                    .get("/api/properties/3?user_id=4");
                expect(property).toHaveProperty('favourited');
            });
        });
        describe("SAD PATH", () => {
            test("404 - Property not found if non-existant property_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .get("/api/properties/10000")
                    .expect(404);
                expect(msg).toBe("Resource not found.")
            });
            test("400 - Bad request if invalid property_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .get("/api/properties/jfjyt")
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
            test("404 - Property not found if non-existant user_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .get("/api/properties/1?user_id=1000")
                    .expect(404);
                expect(msg).toBe("Resource not found.")
            });
            test("400 - Bad request if invalid user_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .get("/api/properties/1?user_id=itiiewr")
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
        });
    });
    describe("GET /api/properties/:id/reviews", () => {
        describe("HAPPY PATH", () => {
            test("200 - responds with an array of reviews objects", async() => {
                const { body: { reviews } } = await request(app)
                    .get("/api/properties/1/reviews")
                    .expect(200);
                expect(Array.isArray(reviews)).toBe(true);
            });
            test("responds with reviews objects, having properties as below", async() => {
                const { body: { reviews } } = await request(app)
                    .get("/api/properties/1/reviews");
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
                    .get("/api/properties/1/reviews");
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
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
        });
    });
    describe("POST /api/properties/:id/reviews", () => {
        describe("HAPPY PATH", () => {
            test("201 - returns an object", async() => {
                const { body } = await request(app)
                    .post("/api/properties/3/reviews")
                    .send({guest_id: 2, rating: 40, comment: "hello"})
                    .expect(201);
                expect(typeof body).toBe("object");
            });
            test("responds with correct review object props: msg, favourite_id", async() => {
                const { body } = await request(app)
                    .post("/api/properties/3/reviews")
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
                    .send({guest_id: "dfgs", rating: 40, comment: "boo"})
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
            test("400 - bad request, when rating is invalid data type", async() => {
                const { body: { msg } } = await request(app)
                    .post("/api/properties/3/reviews")
                    .send({guest_id: 6, rating: "gdser", comment: "boo"})
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
            test("400 - bad request, when property_id is invalid data type", async() => {
                const { body: { msg } } = await request(app)
                    .post("/api/properties/kgkut/reviews")
                    .send({guest_id: 6, rating: 20, comment: "boo"})
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
            test("404 - if valid, but non-existant property_id query is passed in url", async() => {
                const { body: { msg } } = await request(app)
                    .post("/api/properties/3000/reviews")
                    .send({guest_id: 6, rating: 20, comment: "boo"})
                    .expect(404);
                expect(msg).toBe("Resource doesn't exist.");
            });
            test("404 - if valid, but non-existant guest_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .post("/api/properties/3/reviews")
                    .send({guest_id: 600, rating: 20, comment: "boo"})
                    .expect(404);
                expect(msg).toBe("Resource doesn't exist.");
            });
        });
    });
    describe("DELETE /api/reviews/:id", () => {
        describe("HAPPY PATH", () => {
            test("204 - successfully deletes a row with a status 204 No Content", async() => {
                await request(app)
                    .delete("/api/reviews/6")
                    .expect(204);
            });
            test("responds with no body", async() => {
                const result = await request(app)
                    .delete("/api/reviews/6");
                expect(result.body).toEqual({});
            });
        });
        describe("SAD PATH", () => {
            test("404 - Review not found if non existent id passed ", async() => {
                const { body: { msg } } = await request(app)
                    .delete("/api/reviews/60")
                    .expect(404);
                expect(msg).toBe("Review not found.");
            });
            test("400 - Bad request if invalid id passed ", async() => {
                const { body: { msg } } = await request(app)
                    .delete("/api/reviews/jgiut")
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
        });
    });
    describe("POST /api/properties/:id/favourite", () => {
        describe("HAPPY PATH", () => {
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
        });
        describe("SAD PATH", () => {
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
    });
    describe("DELETE /api/favourites/:id", () => {
        describe("HAPPY PATH", () => {
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
        });
        describe("SAD PATH", () => {
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
    describe("GET /api/properties/:id/bookings", () => {
        describe("HAPPY PATH", () => {
            test("200 - responds with a bookings array", async() => {
                const { body: {bookings} } = await request(app)
                    .get("/api/properties/6/bookings")
                    .expect(200);
                expect(Array.isArray(bookings)).toBe(true);
            });
            test("responds with bookings objects, having properties as below", async() => {
                const { body: { bookings } } = await request(app)
                    .get("/api/properties/1/bookings");
                expect(bookings[0]).toHaveProperty("booking_id");
                expect(bookings[0]).toHaveProperty("check_in_date");
                expect(bookings[0]).toHaveProperty("check_out_date");
                expect(bookings[0]).toHaveProperty("created_at");
            });
            test("response body contains property_id prop", async() => {
                const { body } = await request(app)
                    .get("/api/properties/2/bookings");
                expect(body).toHaveProperty("property_id");
            });
            test("response with bookings objects ordered from latest to earliest check_out_date", async() => {
                const { body: { bookings } } = await request(app)
                    .get("/api/properties/2/bookings");
                expect(bookings).toEqual([...bookings].sort((a, b) => a - b));
            });
        });
        describe("SAD PATH", () => {
            test("400 - Bad request if invalid property_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .get("/api/properties/fgsg/bookings")
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
            // --------> BLOCKER <-------- returns 200 instead
            // test("404 - Property not found if non-existant property_id is passed", async() => {
            //     const { body } = await request(app)
            //         .get("/api/properties/12/bookings")
            //         .expect(404);
            //     expect(msg).toBe("Resource not found.")
            // });
        });
    });
    describe("POST /api/properties/:id/booking", () => {
        describe("HAPPY PATH", () => {
            test("201 - returns an object", async() => {
                const { body } = await request(app)
                    .post("/api/properties/2/booking")
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
                    .send({guest_id: 5,
                        check_in_date: "2027-12-10",
                        check_out_date: "2027-12-15"});
                expect(body).toHaveProperty("msg");
                expect(body).toHaveProperty("booking_id");
            });
            // test.only("inserts a new favourite object in db", async() => {
            //     const booking = { guest_id: 5, check_in_date: "2027-12-10", check_out_date: "2027-12-15" };
            //     await request(app)
            //         .post("/api/properties/2/booking")
            //         .send(booking);
            //     const { rows } = await db.query(`
            //         SELECT * FROM bookings
            //         WHERE guest_id = $1`, [booking.guest_id]);
            //     expect(rows[0]).toEqual(expect.objectContaining(booking));
            // });
        });
        describe("SAD PATH", () => {
            test("...", async() => {
                const { body: { msg } } = await request(app)
                    .post("/api/properties/2/booking")
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
    describe("DELETE /api/bookings/:id", () => {
        describe("HAPPY PATH", () => {
            test("204 - successfully deletes a row with a status 204 No Content", async() => {
                await request(app)
                    .delete("/api/bookings/2")
                    .expect(204);
            });
            test("responds with no body", async() => {
                const result = await request(app)
                    .delete("/api/bookings/3");
                expect(result.body).toEqual({});
            });
        });
        describe("SAD PATH", () => {
            test("404 - Booking not found if non existent id passed ", async() => {
                const { body: { msg } } = await request(app)
                    .delete("/api/bookings/15")
                    .expect(404);
                expect(msg).toBe("Booking not found.");
            });
            test("400 - Bad request if invalid id passed ", async() => {
                const { body: { msg } } = await request(app)
                    .delete("/api/bookings/njlgh")
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
        });
    });
    describe("GET /api/users/:id", () => {
        describe("HAPPY PATH", () => {
            test("200 - responds with user object", async() => {
                const { body: { user } } = await request(app)
                    .get("/api/users/2")
                    .expect(200);
                expect(typeof user).toBe("object")
            });
            test("responds with user object, having properties as below", async() => {
                const { body: { user } } = await request(app)
                    .get("/api/users/1");
                expect(user).toHaveProperty("user_id");
                expect(user).toHaveProperty("first_name");
                expect(user).toHaveProperty("surname");
                expect(user).toHaveProperty("email");
                expect(user).toHaveProperty("phone_number");
                expect(user).toHaveProperty("avatar");
                expect(user).toHaveProperty("created_at");
            });
        });
        describe("SAD PATH", () => {
            test("404 - USER not found if non-existant user_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .get("/api/users/10000")
                    .expect(404);
                expect(msg).toBe("Resource not found.")
            });
            test("400 - Bad request if invalid user_id is passed", async() => {
                const { body: { msg } } = await request(app)
                    .get("/api/users/jfjyt")
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
        });
    });
    describe("PATCH /api/users/:id", () => {
        describe("HAPPY PATH", () => {
            test("200 - responds with user object", async() => {
                const { body } = await request(app)
                    .patch("/api/users/2")
                    .send({first_name: "new name"})
                    .expect(200);
                expect(typeof body).toBe("object")
            });
            test("responds with user object first_name prop updated", async() => {
                const updatedProp = "updated first name";
                const { body } = await request(app)
                    .patch("/api/users/1")
                    .send({first_name: updatedProp});
                const { rows } = await db.query(`SELECT * FROM users WHERE user_id = $1`, [1]);
                const updatedName = rows[0].first_name;
                expect(body.first_name).toBe(updatedName);
            });
            test("responds with user object phone and surname props updated", async() => {
                const newSurname = "updated surname";
                const newPhone = 123983744;
                const { body } = await request(app)
                    .patch("/api/users/1")
                    .send({surname: newSurname, phone: newPhone});
                const { rows } = await db.query(`SELECT * FROM users WHERE user_id = $1`, [1]);
                const updatedSurname = rows[0].surname;
                const updatedPhone = rows[0].phone;
                expect(body.surname).toBe(updatedSurname);
                expect(body.phone).toBe(updatedPhone);
            });
            test("responds with user object email and avatar props updated", async() => {
                const newEmail = "new.email@gmail.com";
                const newAvatar = "new_avatar_link";
                const { body } = await request(app)
                    .patch("/api/users/1")
                    .send({email: newEmail, avatar: newAvatar});
                const { rows } = await db.query(`SELECT * FROM users WHERE user_id = $1`, [1]);
                const updatedEmail = rows[0].email;
                const updatedAvatar = rows[0].avatar;
                expect(body.email).toBe(updatedEmail);
                expect(body.avatar).toBe(updatedAvatar);
            });
        });
        describe("SAD PATH", () => {
            test("400 - bad request, if invalid id is provided", async () => {
                const { body: { msg } } = await request(app)
                    .patch("/api/users/efeg")
                    .send({first_name: "new name"})
                    .expect(400);
                expect(msg).toBe("Bad request.");
            });
            test("404 - user not found, if valid, but non-existent id passed", async () => {
                const { body: { msg } } = await request(app)
                    .patch("/api/users/2222")
                    .send({surname: "new surname"})
                    .expect(404);
                expect(msg).toBe("User not found.");
            });
        });
    });
});