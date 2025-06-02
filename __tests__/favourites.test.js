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

describe("DELETE /api/favourites/:id", () => {
    beforeAll(async () => {
        token = await getTestToken();
    });

    describe("HAPPY PATH", () => {
        test("204 - successfully deletes a row with a status 204 No Content and returns no body", async() => {
            await request(app)
                .delete("/api/favourites/2")
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
            expect(result.body).toEqual({});
        });
    });
    describe("SAD PATH", () => {
        test("404 - Favourite not found if non existent id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/favourites/12")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
            expect(msg).toBe("Favourite not found.");
        });
        test("400 - Bad request if invalid id passed ", async() => {
            const { body: { msg } } = await request(app)
                .delete("/api/favourites/bkugsdf")
                .set("Authorization", `Bearer ${token}`)
                .expect(400);
            expect(msg).toBe("Bad request.");
        });
        test("401 - Unauthorized if no token is provided", async () => {
            const { body: { msg } } = await request(app)
                .delete("/api/favourites/2")
                .expect(401);
            expect(msg).toBe("Missing authorization header.");
        });
        test("403 - Unauthorized if invalid token is provided", async () => {
            const { body: { msg } } = await request(app)
                .delete("/api/favourites/2")
                .set("Authorization", "Bearer invalid_token")
                .expect(403);
            expect(msg).toBe("Invalid or expired token.");
        });
    });
});