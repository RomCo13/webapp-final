import { useState } from 'react';
import apiClient from '../services/api-client';
import './CreatePostDialog.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { uploadPhoto } from '../services/file-service';

interface CreatePostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

function CreatePostDialog({ isOpen, onClose, onPostCreated }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      // Create preview URL
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No auth token found');

      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await uploadPhoto(selectedImage);
      }

      await apiClient.post('/studentpost', 
        { 
          title, 
          content,
          imageUrl 
        },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setTitle('');
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
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
          
          {/* Image Upload Section */}
          <div className="form-group image-upload-section">
            <label htmlFor="image" className="image-upload-label">
              <FontAwesomeIcon icon={faImage} /> Add Image
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageSelect}
              className="image-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="remove-image-btn"
                >
                  Remove
                </button>
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