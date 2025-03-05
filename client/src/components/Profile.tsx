import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import Post, { PostData } from "./Post";
import postService, { CanceledError } from "../services/posts-service";
import "./PostsList.css";

interface ProfileProps {
  userEmail: string;
}

function Profile({ userEmail }: ProfileProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Add this hook

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
      <div className="flex justify-between items-center mb-4">
        <h1>My Posts</h1>
        <button
          className="btn-post-view"
          onClick={() => navigate("/posts")} // Navigate to PostList
        >
          Back to All Posts
        </button>
      </div>

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
