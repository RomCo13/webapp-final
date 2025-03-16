// PostsList.tsx
import { useEffect, useState } from 'react';
import Post, { PostData } from './Post';
import postService, { CanceledError } from "../services/posts-service";
import CreatePostDialog from './CreatePostDialog';
import { OpenAI } from 'openai'; // Add OpenAI client library
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

    const openai = new OpenAI({
        apiKey: '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', // WARNING: Don't commit this to version control!
        dangerouslyAllowBrowser: true 
    });

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
        setPosts(currentPosts => [newPost, ...currentPosts]);
    };

    const handleGenerateAIPost = async () => {
        try {
            setIsLoadingAI(true);

            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { 
                        role: "system", 
                        content: "You are a creative social media content generator. Return JSON with 'title' and 'content' fields."
                    },
                    { 
                        role: "user", 
                        content: `Generate a social media post as if written by ${userEmail}. 
                                Make it engaging, 2-3 sentences long, on a random interesting topic. 
                                Include a title and content.`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const aiResponse = JSON.parse(completion.choices[0].message.content!);

            // Create post object matching PostData interface
            const newPost: PostData = {
                _id: Date.now().toString(), // Temporary ID since we're not saving to backend
                title: aiResponse.title,
                content: aiResponse.content,
                student: { email: userEmail },
                likes: []
            };

            // Add to posts array
            setPosts(currentPosts => [newPost, ...currentPosts]);

            // Optional: Save to backend if needed
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