import React, { useState, useEffect } from 'react';
import './Post.css'; // Assuming you will create a CSS file for styling
import { fetchCommentsByPostId } from '../services/comments-service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import apiClient from '../services/api-client';

export interface PostData {
  _id: string;
  title: string;
  content: string;
  student: {
    email: string;
  };
  imageUrl?: string; // Optional image URL for the post
}

interface PostProps {
  post: PostData;
  userEmail: string;
}

function Post({ post, userEmail }: PostProps) {
  const [comments, setComments] = useState<{ author: string; content: string }[]>([]);
  const [newComment, setNewComment] = useState({ content: '' });
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState({
    title: post.title,
    content: post.content
  });

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await fetchCommentsByPostId(post._id);
        setComments(data);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    };

    loadComments();
  }, [post._id]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewComment({ ...newComment, content: e.target.value });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const response = await apiClient.post(
            `/comments/${post._id}`, 
            { ...newComment, author: userEmail },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        const addedComment = response.data;
        setComments([...comments, addedComment]);
        setNewComment({ content: '' });
    } catch (error) {
        console.error('Error adding comment:', error);
    }
};

const handleEditClick = () => {
    setIsEditing(true);
};

const handleSaveEdit = async () => {
    try {
        const response = await apiClient.put(`/studentpost/${post._id}`, editedPost);
        // Update the post in the UI
        post.title = editedPost.title;
        post.content = editedPost.content;
        setIsEditing(false);
    } catch (error) {
        console.error('Error updating post:', error);
    }
};
  const handleCancelEdit = () => {
    setEditedPost({
      title: post.title,
      content: post.content
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="post-header">
        <img
          src="/src/assets/avatar.jpeg" // Placeholder for user profile picture
          alt="User profile"
          className="profile-pic"
        />
        <span className="user-email">{post.student.email}</span>
        <button 
          className="edit-button"
          onClick={handleEditClick}
        >
          <FontAwesomeIcon icon={faPencilAlt} />
        </button>
      </div>
      <div className="post-content">
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={editedPost.title}
              onChange={(e) => setEditedPost({...editedPost, title: e.target.value})}
              className="edit-input"
            />
            <textarea
              value={editedPost.content}
              onChange={(e) => setEditedPost({...editedPost, content: e.target.value})}
              className="edit-textarea"
            />
            <div className="edit-buttons">
              <button onClick={handleSaveEdit} className="save-button">Save</button>
              <button onClick={handleCancelEdit} className="cancel-button">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="post-title">{post.title}</h2>
            <p className="post-description">{post.content}</p>
          </>
        )}
      </div>
      <div className="comments-toggle" onClick={() => setShowComments(!showComments)}>
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </div>
      {showComments && (
        <div className="comments-section">
          <h3>Comments</h3>
          <ul>
            {comments.map((comment, index) => (
              <li key={index}>
                <strong>{comment.author}:</strong> {comment.content}
              </li>
            ))}
          </ul>
          <div className="comments-divider"></div>
          <form className="new-comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              name="content"
              value={newComment.content}
              onChange={handleCommentChange}
              placeholder="Add a comment"
              required
            />
            <button type="submit">Post Comment</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Post;
