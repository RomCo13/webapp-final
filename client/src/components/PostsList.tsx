import { useEffect, useState } from 'react'
import Post, { PostData } from './Post'
import postService, { CanceledError } from "../services/posts-service"
import './PostsList.css'

// Add userEmail to props
interface PostsListProps {
    userEmail: string;
}

function PostList({ userEmail }: PostsListProps) {
    const [posts, setPosts] = useState<PostData[]>([])
    const [error, setError] = useState()

    useEffect(() => {
        const { req, abort } = postService.getAllPosts()
        req.then((res) => {
            setPosts(res.data.data)
        }).catch((err) => {
            console.log(err)
            if (err instanceof CanceledError) return
            setError(err.message)
        })
        return () => abort()
    }, [])

    return (
        <div className="posts-list-container">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-4">
                {posts.map((post, index) => (
                    <div 
                        key={index}
                        className="post-item bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden mb-4"
                    >
                        <div className="relative">
                            {/* Main Post Content */}
                            <div className="p-4">
                                <Post post={post} userEmail={userEmail} />
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Empty State */}
                {posts.length === 0 && !error && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-500 text-lg">No posts to display yet</p>
                        <p className="text-gray-400 mt-1">Check back later for updates!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostList