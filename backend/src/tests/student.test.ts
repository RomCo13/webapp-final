import request from "supertest";
import initApp from "../app";
import mongoose from "mongoose";
import { Student } from "../models/student.model";
import { Express } from "express";
import User from "../models/user_model";

// Add proper mock for Student model
jest.mock('../models/student.model', () => ({
    Student: {
        create: jest.fn().mockImplementation((data) => Promise.resolve(data)),
        find: jest.fn().mockResolvedValue([{
            name: "John Doe",
            _id: "test-id",
        }]),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({}),
    }
}));

let app: Express;
let accessToken: string;
const user = {
  email: "testStudent@test.com",
  password: "1234567890",
}
beforeAll(async () => {
  app = await initApp();
  console.log("beforeAll");
  await Student.deleteMany();

  User.deleteMany({ 'email': user.email });
  await request(app).post("/auth/register").send(user);
  const response = await request(app).post("/auth/login").send(user);
  accessToken = response.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

interface IStudent {
  name: string;
  _id: string;
}

const student: IStudent = {
  name: "John Doe",
  _id: "test-id",
};

describe("Student tests", () => {
  const addStudent = async (student: IStudent) => {
    // Mock Student.create to resolve successfully
    (Student.create as jest.Mock).mockResolvedValueOnce({
        ...student,
        save: jest.fn().mockResolvedValue(true)
    });

    const response = await request(app)
        .post("/students")
        .set("Authorization", "JWT " + accessToken)
        .send(student);
    expect(response.statusCode).toBe(201);
  };
  test("Test Get All Students - empty response", async () => {
    (Student.find as jest.Mock).mockResolvedValueOnce([]);
    const response = await request(app).get("/students").set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual([]);
  });

  test("Test Post Student", async () => {
    addStudent(student);
  });

  test("Test Get All Students with one student in DB", async () => {
    const mockStudent = {
        name: "John Doe",
        _id: "test-id",
    };
    (Student.find as jest.Mock).mockResolvedValueOnce([mockStudent]);
    
    const response = await request(app).get("/students").set("Authorization", "JWT " + accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
    const st = response.body[0];
    expect(st.name).toBe(student.name);
    expect(st._id).toBe(student._id);
  });

  test("Test Post duplicate Student", async () => {
    // Mock Student.create to reject with duplicate key error
    const error: any = new Error('Duplicate key error');
    error.code = 11000;
    error.name = 'MongoError';
    (Student.create as jest.Mock).mockRejectedValueOnce(error);

    const response = await request(app)
        .post("/students")
        .set("Authorization", "JWT " + accessToken)
        .send(student);
    expect(response.statusCode).toBe(500);
  });

  // test("Test PUT /student/:id", async () => {
  //   const updatedStudent = { ...student, name: "Jane Doe 33" };
  //   const response = await request(app)
  //     .put(`/student/${student._id}`)
  //     .send(updatedStudent);
  //   expect(response.statusCode).toBe(200);
  //   expect(response.body.name).toBe(updatedStudent.name);
  // });

  // test("Test DELETE /student/:id", async () => {
  //   const response = await request(app).delete(`/student/${student._id}`);
  //   expect(response.statusCode).toBe(200);
  // });
});
