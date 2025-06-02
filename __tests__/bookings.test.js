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

describe("PATCH /api/bookings/:id", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });

    describe("HAPPY PATH", () => {
        // check the dates created with time zone and day itself is influenced (17 instead of 18)
        // check_in_date: '2025-06-11T23:00:00.000Z'
        // check_out_date: '2025-06-17T23:00:00.000Z'
        test("200 - responds with booking object", async() => {
            const { body } = await request(app)
                .patch("/api/bookings/1")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    check_in_date: "2025-06-12",
                    check_out_date: "2025-06-18"
                })
                .expect(200);
            expect(typeof body).toBe("object")
        });
        test("responds with booking object check_in_date prop updated", async() => {
            const updatedProp = "2025-06-12";
            const { body } = await request(app)
                .patch("/api/bookings/1")
                .set("Authorization", `Bearer ${token}`)
                .send({check_in_date: updatedProp});
            const { rows } = await db.query(`SELECT * FROM bookings WHERE booking_id = $1`, [1]);
            const updatedCheckIn = rows[0].check_in_date.toISOString();
            expect(body.check_in_date).toBe(updatedCheckIn);
        });
        test("responds with booking object check_out prop updated", async() => {
            const updatedProp = "2025-06-18";
            const { body } = await request(app)
                .patch("/api/bookings/1")
                .set("Authorization", `Bearer ${token}`)
                .send({check_out_date: updatedProp});
            const { rows } = await db.query(`SELECT * FROM bookings WHERE booking_id = $1`, [1]);
            const updatedCheckOut = rows[0].check_out_date.toISOString();
            expect(body.check_out_date).toBe(updatedCheckOut);
        });
        test("responds with booking object check_in and check_out dates props updated", async() => {
            const newCheckIn = "2025-06-14";
            const newCheckOut = "2025-06-22";
            const { body } = await request(app)
                .patch("/api/bookings/1")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    check_in_prop: newCheckIn,
                    check_out_date: newCheckOut
                });
            const { rows } = await db.query(`SELECT * FROM bookings WHERE booking_id = $1`, [1]);
            const updatedCheckIn = rows[0].check_in_date.toISOString();
            const updatedCheckOut = rows[0].check_out_date.toISOString();
            expect(body.check_in_date).toBe(updatedCheckIn);
            expect(body.check_out_date).toBe(updatedCheckOut);
        });
    });
    describe("SAD PATH", () => {
        test("400 - bad request, if invalid id is provided", async () => {
            const { body: { msg } } = await request(app)
                .patch("/api/bookings/fehe")
                .set("Authorization", `Bearer ${token}`)
                .send({check_in_date: "2025-04-14"})
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("404 - user not found, if valid, but non-existent id passed", async () => {
            const { body: { msg } } = await request(app)
                .patch("/api/bookings/51")
                .set("Authorization", `Bearer ${token}`)
                .send({check_in_date: "2025-04-14"})
                .expect(404);
            expect(msg).toBe("Booking not found.");
        });
    });
});

describe("DELETE /api/bookings/:id", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });

    describe("HAPPY PATH", () => {
        test("204 - successfully deletes a row with a status 204 No Content", async() => {
            await request(app)
                .delete("/api/bookings/2")
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
        });
        test("responds with no body", async() => {
            const result = await request(app)
                .delete("/api/bookings/3")
                .set("Authorization", `Bearer ${token}`);
            expect(result.body).toEqual({});
        });
    });
    describe("SAD PATH", () => {
        test("404 - Booking not found if non existent id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/bookings/15")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Booking not found.");
        });
        test("400 - Bad request if invalid id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/bookings/njlgh")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
    });
});

