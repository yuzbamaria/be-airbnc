const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test/index");
const seed = require("../db/seed");
const getTestToken = require("./utils/testLogin");

beforeEach(() => {
    return seed(data);
});

afterAll(() => {
    return db.end();
});

describe("GET /api/users/:id", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });
    
    describe("HAPPY PATH", () => {
        test("200 - responds with user object", async() => {
            const { body: { user } } = await request(app)
                .get("/api/users/2")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);
            expect(typeof user).toBe("object")
        });
        test("responds with user object, having properties as below", async() => {
            const { body: { user } } = await request(app)
                .get("/api/users/1")
                .set("Authorization", `Bearer ${token}`);
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
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Resource not found.")
        });
        test("400 - Bad request if invalid user_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/users/jfjyt")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("401 - Unauthorized (missing authorization header), if no token is provided", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/users/1")
                .expect(401);
            expect(msg).toBe("Missing authorization header.");
        });
        test("403 - Unauthorized (invalid or expired token) if token is invalid", async () => {
            const { body: { msg } } = await request(app)
                .get("/api/users/1")
                .set("Authorization", "Bearer fake_token_123")
                .expect(403);
            expect(msg).toBe("Invalid or expired token.");
        });
    });
});

describe("PATCH /api/users/:id", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });

    describe("HAPPY PATH", () => {
        test("200 - responds with user object", async() => {
            const { body } = await request(app)
                .patch("/api/users/2")
                .set("Authorization", `Bearer ${token}`)
                .send({first_name: "new name"})
                .expect(200);
            expect(typeof body).toBe("object")
        });
        test("responds with user object first_name prop updated", async() => {
            const updatedProp = "updated first name";
            const { body } = await request(app)
                .patch("/api/users/1")
                .set("Authorization", `Bearer ${token}`)
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
                .set("Authorization", `Bearer ${token}`)
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
                .set("Authorization", `Bearer ${token}`)
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
                .set("Authorization", `Bearer ${token}`)
                .send({first_name: "new name"})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - user not found, if valid, but non-existent id passed", async () => {
            const { body: { msg } } = await request(app)
                .patch("/api/users/2222")
                .set("Authorization", `Bearer ${token}`)
                .send({surname: "new surname"})
                .expect(404);
            expect(msg).toBe("User not found.");
        });
        test("401 - Unauthorized (missing authorization header), if no token is provided", async () => {
            const { body: { msg } } = await request(app)
                .patch("/api/users/1")
                .send({ first_name: "jhfjf" })
                .expect(401);
            expect(msg).toBe("Missing authorization header.");
        });
        test("403 - Unauthorized (invalid or expired token), if token is invalid", async () => {
            const { body: { msg } } = await request(app)
                .patch("/api/users/1")
                .set("Authorization", "Bearer fake_token_123")
                .send({ surname: "khfgky" })
                .expect(403);
            expect(msg).toBe("Invalid or expired token.");
        });
    });
});

describe("GET /api/users/:id/bookings", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });
    
    describe("HAPPY PATH", () => {
        test("200 - responds with bookings array of objects", async() => {
            const { body: { bookings } } = await request(app)
                .get("/api/users/2/bookings")
                .set("Authorization", `Bearer ${token}`)
                .expect(200);
            expect(Array.isArray(bookings)).toBe(true);
            expect(typeof bookings[0]).toBe("object");
        });
        test("responds with reviews objects, having properties as below", async() => {
            const { body: { bookings } } = await request(app)
                .get("/api/users/2/bookings")
                .set("Authorization", `Bearer ${token}`);
            expect(bookings[0]).toHaveProperty("booking_id");
            expect(bookings[0]).toHaveProperty("check_in_date");
            expect(bookings[0]).toHaveProperty("check_out_date");
            expect(bookings[0]).toHaveProperty("property_id");
            expect(bookings[0]).toHaveProperty("property_name");
            expect(bookings[0]).toHaveProperty("host");
            expect(bookings[0]).toHaveProperty("images");
        });
        // test.only("response with bookings objects ordered from latest to earliest check_out_date", async() => {
        //     const { body: { bookings } } = await request(app)
        //         .get("/api/users/6/bookings");
        //     console.log(bookings)
        // });
    });
    describe("SAD PATH", () => {
        test("400 - Bad request if invalid user_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/users/ghjyr/bookings")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - Property not found if non-existant property_id is passed", async() => {
            const { body: { msg } } = await request(app)
                .get("/api/users/12/bookings")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Resource not found.")
        });
        test("401 - Unauthorized (missing authorization header), if no token is provided", async () => {
            const { body: { msg } } = await request(app)
                .get("/api/users/12/bookings")
                .expect(401);
            expect(msg).toBe("Missing authorization header.");
        });
        test("403 - Unauthorized (invalid or expired token), if token is invalid", async () => {
            const { body: { msg } } = await request(app)
                .get("/api/users/12/bookings")
                .set("Authorization", "Bearer fake_token")
                .expect(403);
            expect(msg).toBe("Invalid or expired token.");
        });
    });
});




