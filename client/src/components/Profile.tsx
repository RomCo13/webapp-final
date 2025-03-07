import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Change to Link
import Post, { PostData } from "./Post";
import postService, { CanceledError } from "../services/posts-service";
import "./PostsList.css";
import "./NavButton.css"; // Import the new CSS
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // Import the arrow icon

interface ProfileProps {
  userEmail: string;
}

function Profile({ userEmail }: ProfileProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const { req, abort } = postService.getAllPosts();
    req
      .then((res) => {
        const userPosts = res.data.data.filter(
          (post: PostData) => post.student.email === userEmail
        );
        setPosts(userPosts);
      })
      .catch((err) => {
        if (err instanceof CanceledError) return;
        setError(err.message);
      });

    return () => abort();
  }, [userEmail]);

  return (
    <div className="posts-list-container">
      <h1 className="mb-4">My Posts</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div key={index} className="post-item">
            <Post post={post} userEmail={userEmail} />
          </div>
        ))}

        {posts.length === 0 && !error && (
          <div className="empty-state">
            <h3>No Posts Yet</h3>
            <p>You haven't created any posts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
