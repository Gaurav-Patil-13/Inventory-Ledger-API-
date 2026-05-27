const request = require("supertest");
const app = require("../app/index");

describe("API Tests", () => {

    test("GET entries", async () => {

        const res = await request(app).get("/entries");

        expect(res.statusCode).toBe(200);
    });

});
