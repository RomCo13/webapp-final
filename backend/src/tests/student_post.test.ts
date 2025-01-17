import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Express } from "express";
import User from "../models/user_model";
import { StudentPost } from "../models/student_post.model";

let app: Express;
let accessToken: string;

beforeAll(async () => {
    app = await initApp();
    const user = {
        email: "test@test.com",
        password: "12345678"
    };
    await request(app).post("/auth/register").send(user);
    const response = await request(app).post("/auth/login").send(user);
    accessToken = response.body.accessToken;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Student Post tests", () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    test("Create post without auth should fail", async () => {
        const response = await request(app)
            .post("/studentpost")
            .send({ title: "Test Post", content: "Test Content" });
        expect(response.statusCode).toBe(401);
    });

    test("Create post with auth should succeed", async () => {
        // Mock StudentPost.create
        const mockPost = {
            title: "Test Post",
            content: "Test Content",
            _id: new mongoose.Types.ObjectId(),
            save: jest.fn().mockResolvedValue(true)
        };

        const response = await request(app)
            .post("/studentpost")
            .set("Authorization", "JWT " + accessToken)
            .send({ title: "Test Post", content: "Test Content" });
        expect(response.statusCode).toBe(201);
    });
});
