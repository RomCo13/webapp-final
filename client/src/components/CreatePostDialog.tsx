import { useState } from 'react';
import apiClient from '../services/api-client';
import './CreatePostDialog.css';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

function CreatePostDialog({ isOpen, onClose, onPostCreated }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      await apiClient.post('/studentpost', 
        { title, content },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setTitle('');
      setContent('');
      onPostCreated();
      onClose();
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
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