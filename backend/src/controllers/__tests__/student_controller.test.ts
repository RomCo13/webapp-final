import { Request, Response } from 'express';
import { StudentController } from '../student_controller';
import { Student } from '../../models/student.model';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

// Mock express-validator properly
jest.mock('express-validator', () => ({
    validationResult: jest.fn()
}));

// Add proper mock for Student model at the top of the file
jest.mock('../../models/student.model', () => ({
    Student: {
        create: jest.fn().mockImplementation((data) => Promise.resolve({
            ...data,
            _id: 'test-id',
            save: jest.fn().mockResolvedValue(true)
        })),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    }
}));

describe('Student Controller', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnThis();
        mockRequest = {};
        mockResponse = {
            json: mockJson,
            status: mockStatus,
        };

        // Reset all mocks
        jest.clearAllMocks();

        // Default validation mock
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => true,
            array: () => []
        });
    });

    // Add tests for uncovered lines
    describe('createStudent', () => {
        it('should handle database error', async () => {
            mockRequest.body = {
                name: 'Test Student',
                email: 'test@test.com'
            };

            const error = new Error('Database error');
            (Student.create as jest.Mock).mockRejectedValueOnce(error);

            await StudentController.createStudent(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to create student',
                error: error.message
            });
        });

        it('should handle validation error', async () => {
            // Mock validation failure
            (validationResult as unknown as jest.Mock).mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Invalid input' }]
            });

            await StudentController.createStudent(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                errors: [{ msg: 'Invalid input' }]
            });
        });

        it('should create student successfully', async () => {
            mockRequest.body = {
                name: 'Test Student',
                email: 'test@test.com'
            };

            const mockStudent = {
                ...mockRequest.body,
                _id: 'test-id',
                save: jest.fn().mockResolvedValue(true)
            };

            (Student.create as jest.Mock).mockResolvedValueOnce(mockStudent);

            await StudentController.createStudent(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                status: 'success',
                data: mockStudent
            });
        });
    });

    describe('get', () => {
        it('should get all students successfully', async () => {
            const mockStudents = [
                { _id: 'id1', name: 'Student 1' },
                { _id: 'id2', name: 'Student 2' }
            ];
            (Student.find as jest.Mock).mockResolvedValueOnce(mockStudents);

            await StudentController.get(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockStudents);
        });

        it('should handle database error in get', async () => {
            const error = new Error('Database error');
            (Student.find as jest.Mock).mockRejectedValueOnce(error);

            await StudentController.get(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Server error" });
        });
    });

    describe('getById', () => {
        it('should get student by id successfully', async () => {
            const mockStudent = { _id: 'valid-id', name: 'Test Student' };
            mockRequest.params = { id: 'valid-id' };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findById as jest.Mock).mockResolvedValueOnce(mockStudent);

            await StudentController.getById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockStudent);
        });

        it('should handle student not found in getById', async () => {
            mockRequest.params = { id: 'valid-id' };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findById as jest.Mock).mockResolvedValueOnce(null);

            await StudentController.getById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: "Student not found" });
        });

        it('should handle database error in getById', async () => {
            mockRequest.params = { id: 'valid-id' };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findById as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await StudentController.getById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Server error" });
        });
    });

    describe('deleteById', () => {
        it('should delete student successfully', async () => {
            mockRequest.params = { id: 'valid-id' };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findByIdAndDelete as jest.Mock).mockResolvedValueOnce({ _id: 'valid-id' });

            await StudentController.deleteById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ message: "Student deleted successfully" });
        });

        it('should handle student not found in deleteById', async () => {
            mockRequest.params = { id: 'valid-id' };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findByIdAndDelete as jest.Mock).mockResolvedValueOnce(null);

            await StudentController.deleteById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: "Student not found" });
        });

        it('should handle database error in deleteById', async () => {
            mockRequest.params = { id: 'valid-id' };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findByIdAndDelete as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

            await StudentController.deleteById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Server error" });
        });
    });

    describe('putById', () => {
        it('should update student successfully', async () => {
            mockRequest.params = { id: 'valid-id' };
            mockRequest.body = { name: 'Updated Name' };
            
            const mockStudent = {
                _id: 'valid-id',
                name: 'Old Name',
                save: jest.fn().mockResolvedValueOnce(true)
            };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findById as jest.Mock).mockResolvedValueOnce(mockStudent);

            await StudentController.putById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockStudent);
        });

        it('should handle save error in putById', async () => {
            mockRequest.params = { id: 'valid-id' };
            mockRequest.body = { name: 'Updated Name' };
            
            const mockStudent = {
                _id: 'valid-id',
                name: 'Old Name',
                save: jest.fn().mockRejectedValueOnce(new Error('Save error'))
            };
            
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            (Student.findById as jest.Mock).mockResolvedValueOnce(mockStudent);

            await StudentController.putById(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ message: "Server error" });
        });
    });
}); 