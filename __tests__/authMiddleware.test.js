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

describe("Auth Middleware", () => {
    beforeAll(async () => {
        token = await getTestToken(); // simulate login 
    });
});
