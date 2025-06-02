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

describe("DELETE /api/reviews/:id", () => {

    beforeAll(async () => {
        token = await getTestToken();
    });

    describe("HAPPY PATH", () => {
        test("204 - successfully deletes a row with a status 204 No Content", async() => {
            await request(app)
                .delete("/api/reviews/6")
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
        });
        test("responds with no body", async() => {
            const result = await request(app)
                .delete("/api/reviews/6")
                .set("Authorization", `Bearer ${token}`);
            expect(result.body).toEqual({});
        });
    });
    describe("SAD PATH", () => {
        test("404 - Review not found if non existent id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/reviews/60")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Review not found.");
        });
        test("400 - Bad request if invalid id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/reviews/jgiut")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
    });
});