import React from 'react';
import './Post.css'; // Assuming you will create a CSS file for styling

export interface PostData {
  title: string;
  content: string;
  student: {
    email: string;
  };
  imageUrl?: string; // Optional image URL for the post
}

interface PostProps {
  post: PostData;
}

function Post({ post }: PostProps) {
  return (
    <div>
      <div className="post-header">
        <img
          src="/src/assets/avatar.jpeg" // Placeholder for user profile picture
          alt="User profile"
          className="profile-pic"
        />
        <span className="user-email">{post.student.email}</span>
      </div>
      <div className="post-content">
        <h2 className="post-title">{post.title}</h2>
        <p className="post-description">{post.content}</p>
      </div>
    </div>
  );
}

export default Post;
