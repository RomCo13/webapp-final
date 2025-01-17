// Import necessary modules and dependencies
import { Student } from '../models/student.model';
import { validationResult } from "express-validator";
import { Request, Response } from 'express';

export class StudentController {
  static async get(req: Request, res: Response) {
    try {
      const students = await Student.find(); // Fetch all students
      res.status(200).json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await Student.findById(id); // Fetch student by ID
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json(student);
    } catch (error) {
      console.error("Error fetching student by ID:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async createStudent(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const student = await Student.create(req.body);
      res.status(201).json({
        status: 'success',
        data: student
      });
    } catch (error) {
      console.error('Error creating student:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create student',
        error: error.message
      });
    }
  }

  static async putById(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { id } = req.params;
      const { name, age, email } = req.body;
      const student = await Student.findById(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      student.name = name;
      await student.save(); // Update the student
      res.status(200).json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  static async deleteById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await Student.findByIdAndDelete(id); // Delete by ID
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}