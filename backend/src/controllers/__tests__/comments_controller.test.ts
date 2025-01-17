import { Request, Response } from 'express';
import { CommentsController } from '../comments_controller';
import mongoose from 'mongoose';
import { StudentPost } from '../../models/student_post.model';
import Comment from '../../models/post_comments';

// Mock the models
jest.mock('../../models/post_comments');
jest.mock('../../models/student_post.model');

describe('Comments Controller', () => {
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

        // Mock mongoose.Types.ObjectId.isValid to return true by default
        mongoose.Types.ObjectId.isValid = jest.fn().mockReturnValue(true);
        
        // Mock StudentPost.findById
        (StudentPost.findById as jest.Mock) = jest.fn().mockResolvedValue({
            comments: ['test-comment-id'],
            save: jest.fn().mockResolvedValue(true)
        });

        // Mock Comment.save
        (Comment.prototype.save as jest.Mock) = jest.fn().mockResolvedValue({
            _id: 'test-id',
            content: 'Test comment',
            author: 'test-author',
            postId: 'valid-post-id'
        });

        // Mock Comment.find
        (Comment.find as jest.Mock) = jest.fn().mockResolvedValue([{
            _id: 'test-id',
            content: 'Test comment',
            author: 'test-author',
            postId: 'valid-post-id'
        }]);

        // Mock Comment.findById
        (Comment.findById as jest.Mock) = jest.fn().mockResolvedValue({
            _id: 'test-comment-id',
            content: 'Test comment',
            author: 'test-author',
            postId: 'valid-post-id'
        });

        // Mock Comment.findByIdAndDelete
        (Comment.findByIdAndDelete as jest.Mock) = jest.fn().mockResolvedValue({
            _id: 'test-comment-id',
            content: 'Test comment',
            author: 'test-author',
            postId: 'valid-post-id'
        });
    });

    describe('createComment', () => {
        it('should create a comment', async () => {
            mockRequest.body = {
                content: 'Test comment',
                author: 'test-author'
            };
            mockRequest.params = {
                postId: 'valid-post-id'
            };

            await CommentsController.createComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(201);
        });

        it('should handle invalid ObjectId', async () => {
            mockRequest.params = { postId: 'invalid-id' };
            mockRequest.body = {
                author: 'Test Author',
                content: 'Test Content'
            };

            // Mock mongoose isValid to return false
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValue(false);

            await CommentsController.createComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Invalid postId format'
            });
        });

        it('should handle post not found', async () => {
            mockRequest.params = { postId: 'valid-id' };
            mockRequest.body = {
                content: 'Test comment',
                author: 'test-author'
            };

            // Mock mongoose.Types.ObjectId.isValid
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true);
            
            // Mock findById to return null
            (StudentPost.findById as jest.Mock).mockResolvedValueOnce(null);

            await CommentsController.createComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Post not found'
            });
        });
    });

    describe('getComments', () => {
        it('should get comments for a post', async () => {
            mockRequest.params = {
                postId: 'valid-post-id'
            };

            await CommentsController.getCommentsByPostId(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
        });
    });

    describe('getCommentsByPostId', () => {
        it('should handle invalid ObjectId for get comments', async () => {

            // Mock mongoose.Types.ObjectId.isValid
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(false);

            await CommentsController.getCommentsByPostId(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
        });
    });

    describe('deleteComment', () => {
        it('should delete a comment', async () => {
            mockRequest.params = {
                id: 'test-comment-id',
                postId: 'valid-post-id'
            };

            await CommentsController.deleteComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({ 
                message: "Comment deleted successfully" 
            });
        });

        it('should return 404 if comment not found', async () => {
            mockRequest.params = {
                id: 'nonexistent-id',
                postId: 'valid-post-id'
            };

            // Mock Comment.findById to return null for this test
            (Comment.findById as jest.Mock).mockResolvedValueOnce(null);

            await CommentsController.deleteComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ 
                message: "Comment not found" 
            });
        });

        it('should return 500 if error occurs', async () => {
            mockRequest.params = {
                id: 'test-comment-id',
                postId: 'valid-post-id'
            };

            // Mock Comment.findById to throw error
            const dbError = new Error('Database error');
            (Comment.findById as jest.Mock).mockRejectedValueOnce(dbError);

            await CommentsController.deleteComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ 
                message: "Error deleting comment",
                error: dbError
            });
        });

        it('should handle invalid ObjectId for comment deletion', async () => {

            // Mock mongoose.Types.ObjectId.isValid
            jest.spyOn(mongoose.Types.ObjectId, 'isValid')
                .mockReturnValueOnce(true)  // for postId
                .mockReturnValueOnce(false); // for commentId

            await CommentsController.deleteComment(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockStatus).toHaveBeenCalledWith(500);
        });
    });
});