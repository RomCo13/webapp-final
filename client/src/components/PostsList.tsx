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
    const [error, setError] = useState<string | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    const fetchPosts = () => {
        const { req, abort } = postService.getAllPosts();
        req.then((res) => {
            setPosts(res.data.data);
        }).catch((err) => {
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
        setPosts(currentPosts => [newPost, ...currentPosts]);
    };

    const handleGenerateAIPost = async () => {
        try {
            setIsLoadingAI(true);
            
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBermvSuYNm9LsIkN5r8gSqXrHMrJQ9fwI", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        role: "user",
                        parts: [{ text: `Generate a social media post as if written by ${userEmail}. Make it engaging, 2-3 sentences long, on a random interesting topic. Include a title and content in JSON format like {\"title\": \"...\", \"content\": \"...\"}.` }]
                    }]
                })
            });
            
            const data = await response.json();
            const rawText = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from text using regex
            const jsonMatch = rawText.match(/\{.*\}/s);
            if (!jsonMatch) {
                throw new Error("AI response did not contain valid JSON");
            }
            
            const aiResponse = JSON.parse(jsonMatch[0]);
            
            const newPost: PostData = {
                _id: Date.now().toString(),
                title: aiResponse.title,
                content: aiResponse.content,
                student: { email: userEmail },
                likes: []
            };

            setPosts(currentPosts => [newPost, ...currentPosts]);

            const token = localStorage.getItem("authToken");
            if (token) {
                try {
                    await postService.createPost(newPost, token);
                } catch (err) {
                    console.error("Failed to save AI post to backend:", err);
                }
            }

        } catch (err: any) {
            console.error("Error generating AI post:", err);
            setError(err.message || "Failed to generate AI post");
        } finally {
            setIsLoadingAI(false);
        }
    };

    return (
        <div className="posts-list-container">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            <h1 className="mb-4">All Posts</h1>

            <button 
                className="floating-button ai-button"
                onClick={handleGenerateAIPost}
                title="Generate AI post"
                disabled={isLoadingAI}
                style={{ marginLeft: '10px' }}
            >
                {isLoadingAI ? '...' : 'AI'}
            </button>
            
            <button 
                className="floating-button"
                onClick={() => setIsDialogOpen(true)}
                title="Create new post"
            >
                +
            </button>



            <CreatePostDialog 
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onPostCreated={handlePostCreated}
            />

            <div className="space-y-4">
                {posts.map((post, index) => (
                    <div 
                        key={index}
                        className="post-item bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden mb-4"
                    >
                        <div className="relative">
                            <div className="p-4">
                                <Post post={post} userEmail={userEmail} />
                            </div>
                        </div>
                    </div>
                ))}
                
                {posts.length === 0 && !error && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-lg">No posts to display yet</p>
                        <p className="text-gray-400 mt-1">Create your first post by clicking the + button!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PostList;