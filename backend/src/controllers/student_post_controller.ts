import { Request, Response } from 'express';
import { StudentPost } from '../models/student_post.model';
import { AuthRequest } from '../common/auth_middleware';

export class StudentPostController {
    static async createPost(req: AuthRequest, res: Response) {
        try {
            const studentId = req.user?._id;

            if (!studentId) {
                return res.status(401).json({
                    status: 'error',
                    message: 'User not authenticated'
                });
            }

            const postData = {
                student: studentId,
                title: req.body.title,
                content: req.body.content
            };

            const post = new StudentPost(postData);
            const savedPost = await post.save();

            const populatedPost = await savedPost.populate('student', 'name email');

            res.status(201).json({
                status: 'success',
                data: populatedPost
            });
        } catch (error) {
            console.error('Error creating student post:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create student post',
                error: error.message
            });
        }
    }

    static async getPosts(req: Request, res: Response) {
        try {
            const posts = await StudentPost.find()
                .populate('student', 'name email')
                .sort({ createdAt: -1 });

            res.status(200).json({
                status: 'success',
                data: posts
            });
        } catch (error) {
            console.error('Error fetching student posts:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch student posts',
                error: error.message
            });
        }
    }

    static async getPostById(req: Request, res: Response) {
        try {
            const post = await StudentPost.findById(req.params.id)
                .populate('student', 'name email');

            if (!post) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Post not found'
                });
            }

            res.status(200).json({
                status: 'success',
                data: post
            });
        } catch (error) {
            console.error('Error fetching student post:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch student post',
                error: error.message
            });
        }
    }

    static async putById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = {
                title: req.body.title,
                content: req.body.content
            };

            const updatedPost = await StudentPost.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            ).populate('student', 'name email');

            if (!updatedPost) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Student post not found'
                });
            }

            res.status(200).json({
                status: 'success',
                data: updatedPost
            });
        } catch (error) {
            console.error('Error updating student post:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update student post',
                error: error.message
            });
        }
    }

    static async deleteById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deletedPost = await StudentPost.findByIdAndDelete(id);

            if (!deletedPost) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Student post not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Student post deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting student post:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to delete student post',
                error: error.message
            });
        }
    }
}
