import apiClient from './api-client';

export const fetchCommentsByPostId = (postId: string) => {
  return apiClient.get(`/comments/${postId}`)
    .then(response => response.data)
    .catch(error => {
      console.error('Error fetching comments:', error);
      throw error;
    });
}; 