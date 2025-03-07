import { useState } from 'react';
import apiClient from '../services/api-client';
import './CreatePostDialog.css';
import { PostData } from './Post';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: PostData) => void;
}

function CreatePostDialog({ isOpen, onClose, onPostCreated }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Simplified function to upload image directly with post ID in the URL
  const uploadImageForPost = async (file: File, postId: string) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post(`/file/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      return response.data.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      // First create the post
      const postResponse = await apiClient.post('/studentpost', 
        { title, content },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      // Get the created post data
      let newPost = postResponse.data.data;
      
      // If we have an image and received a post ID, upload the image
      if (selectedImage && newPost._id) {
        const postId = newPost._id;
        
        // Upload image with post ID in the URL
        const imageUrl = await uploadImageForPost(selectedImage, postId);
        
        // Update the post with the image URL
        await apiClient.put(`/studentpost/${postId}`,
          { imageUrl },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        // Add the image URL to our post object for immediate UI update
        newPost.imageUrl = imageUrl;
      }
      
      // Clear form and close dialog
      setTitle('');
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      
      // Pass the complete post data back to parent
      onPostCreated(newPost);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h2>Create New Post</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Image (optional)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageSelect}
              className="form-control"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
          <div className="dialog-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-button"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostDialog; 