import { Request, Response } from 'express';
import { StudentPostController } from '../student_post_controller';
import mongoose from 'mongoose';
import { AuthRequest } from '../../common/auth_middleware';
import { StudentPost } from '../../models/student_post.model';

// Add proper mock for StudentPost model at the top of the file
jest.mock('../../models/student_post.model', () => ({
    StudentPost: {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn()
    }
}));

describe('StudentPostController', () => {
    let req: Partial<AuthRequest>;
    let res: Partial<Response>;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        req = {
            body: {},
            params: {},
            query: {},
            user: { _id: new mongoose.Types.ObjectId().toString() }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });


    describe('getPosts', () => {
        it('should get all posts successfully', async () => {
            const mockPosts = [{
                _id: 'test-id',
                title: 'Test Post',
                content: 'Test Content'
            }];

            (StudentPost.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockPosts)
                })
            });

            await StudentPostController.getPosts(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                data: expect.any(Array)
            });
        });

        it('should handle database error in getPosts', async () => {
            (StudentPost.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    sort: jest.fn().mockRejectedValue(new Error('Database error'))
                })
            });

            await StudentPostController.getPosts(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to fetch student posts',
                error: expect.any(String)
            });
        });
    });

    describe('getPostById', () => {
        it('should get a single post successfully', async () => {
            const mockPost = {
                _id: new mongoose.Types.ObjectId(),
                title: 'Test Post',
                content: 'Test Content'
            };
            
            req.params = { id: mockPost._id.toString() };
            
            (StudentPost.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPost)
            });

            await StudentPostController.getPostById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                data: expect.any(Object)
            });
        });

        it('should handle not found post', async () => {
            req.params = { id: 'nonexistent-id' };
            (StudentPost.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await StudentPostController.getPostById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Post not found'
            });
        });

        it('should handle database error in getPostById', async () => {
            req.params = { id: 'valid-id' };
            
            (StudentPost.findById as jest.Mock).mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            await StudentPostController.getPostById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to fetch student post',
                error: expect.any(String)
            });
        });
    });

    describe('putById', () => {
        it('should update a post successfully', async () => {
            const mockPost = {
                _id: new mongoose.Types.ObjectId(),
                title: 'Updated Title',
                content: 'Updated Content'
            };
            
            req.params = { id: mockPost._id.toString() };
            req.body = { title: 'Updated Title', content: 'Updated Content' };
            
            (StudentPost.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPost)
            });

            await StudentPostController.putById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                data: expect.any(Object)
            });
        });

        it('should handle not found post during update', async () => {
            req.params = { id: 'nonexistent-id' };
            (StudentPost.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await StudentPostController.putById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Student post not found'
            });
        });

        it('should handle database error in putById', async () => {
            req.params = { id: 'valid-id' };
            req.body = { title: 'Updated Title' };
            
            (StudentPost.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockRejectedValue(new Error('Database error'))
            });

            await StudentPostController.putById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to update student post',
                error: expect.any(String)
            });
        });
    });

    describe('deleteById', () => {
        it('should delete a post successfully', async () => {
            const mockPost = {
                _id: new mongoose.Types.ObjectId(),
                title: 'To Be Deleted',
            };
            
            req.params = { id: mockPost._id.toString() };
            
            (StudentPost.findByIdAndDelete as jest.Mock).mockResolvedValue(mockPost);

            await StudentPostController.deleteById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                status: 'success',
                message: 'Student post deleted successfully'
            });
        });

        it('should handle not found post during deletion', async () => {
            req.params = { id: 'nonexistent-id' };
            (StudentPost.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await StudentPostController.deleteById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Student post not found'
            });
        });

        it('should handle database error in deleteById', async () => {
            req.params = { id: 'valid-id' };
            
            (StudentPost.findByIdAndDelete as jest.Mock)
                .mockRejectedValue(new Error('Database error'));

            await StudentPostController.deleteById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Failed to delete student post',
                error: expect.any(String)
            });
        });
    });
}); 