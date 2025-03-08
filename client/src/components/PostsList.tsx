import { useEffect, useState } from 'react';
import Post, { PostData } from './Post';
import postService, { CanceledError } from "../services/posts-service";
import CreatePostDialog from './CreatePostDialog';
import './PostsList.css';
import './NavButton.css';

interface PostsListProps {
  userEmail: string;
}

function PostList({ userEmail }: PostsListProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch generated posts from an external API (e.g., ChatGPT)
  const fetchGeneratedPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Example API call - replace with your actual API endpoint (e.g., OpenAI)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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', // Replace with your API key
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Generate a random social media post with a title and content in the following JSON format: { "title": "string", "content": "string" }',
            },
          ],
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch generated posts');
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;

      // Parse the generated JSON text into a PostData object
      const generatedPost = JSON.parse(generatedText);

      const newPost: PostData = {
        _id: Date.now().toString(), // Temporary ID
        title: generatedPost.title,
        content: generatedPost.content,
        student: {
          email: 'generated@example.com', // Placeholder for generated posts
        },
        likes: [], // Initialize with no likes
        imageUrl: undefined, // No image for generated posts (optional: fetch a random image URL)
      };

      setPosts((currentPosts) => [newPost, ...currentPosts]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch regular posts from your backend
  const fetchPosts = () => {
    const { req, abort } = postService.getAllPosts();
    req.then((res) => {
      setPosts(res.data.data);
    }).catch((err) => {
      console.log(err);
      if (err instanceof CanceledError) return;
      setError(err.message);
    });
    return abort;
  };

  useEffect(() => {
    const abort = fetchPosts();
    return () => abort();
  }, []);

  const handlePostCreated = (newPost: PostData) => {
    setPosts((currentPosts) => [newPost, ...currentPosts]);
  };

  return (
    <div className="posts-list-container">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <h1 className="mb-4">All Posts</h1>

      <div className="flex space-x-4 mb-4">
        <button
          className="floating-button"
          onClick={() => setIsDialogOpen(true)}
          title="Create new post"
        >
          +
        </button>
        <button
          className="floating-button bg-blue-500 hover:bg-blue-600 text-white"
          onClick={fetchGeneratedPosts}
          disabled={isLoading}
          title="Generate random post"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <CreatePostDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onPostCreated={handlePostCreated}
      />

      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="post-item bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden mb-4"
          >
            <div className="relative">
              <div className="p-4">
                <Post post={post} userEmail={userEmail} />
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && !error && !isLoading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg">No posts to display yet</p>
            <p className="text-gray-400 mt-1">Create your first post or generate one!</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading generated post...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostList;