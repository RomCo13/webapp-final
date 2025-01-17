
import mongoose from "mongoose";
import Comment from "../models/post_comments";
import { StudentPost } from "../models/student_post.model";

export const CommentsController = {
  async getCommentsByPostId(req, res) {
    try {
      const { postId } = req.params;
      const comments = await Comment.find({ postId });
      res.status(200).json(comments);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving comments", error });
    }
  },

  async createComment(req, res) {
    try {
      const { postId } = req.params;
      const { author, content } = req.body;

      // Validate input
      if (!author || !content) {
        return res.status(400).json({ message: "Author and content are required" });
      }

      // Validate postId format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "Invalid postId format" });
      }

      // Check if the post exists
      const post = await StudentPost.findById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Create and save the new comment
      const newComment = new Comment({
        postId,
        author,
        content,
      });
      const savedComment = await newComment.save();

      // Update the post's comments array
      post.comments.push(savedComment._id);
      await post.save();

      // Return the created comment
      res.status(201).json(savedComment);
    } catch (error) {
      res.status(500).json({ message: "Error creating comment", error });
    }
  },

  async deleteComment(req, res) {
    try {
      const { id } = req.params;

      // Find the comment to delete
      const comment = await Comment.findById(id);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }

      // Delete the comment
      await Comment.findByIdAndDelete(id);

      // Update the related post
      const post = await StudentPost.findById(comment.postId);
      if (post) {
        // Remove the comment ID from the comments array
        post.comments = post.comments.filter(
          (commentId) => commentId.toString() !== id
        );
        await post.save(); // Save the updated post
      }

      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting comment", error });
    }
  }
};