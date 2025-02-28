import { useEffect, useState } from 'react'
import Post, { PostData } from './Post'
import postService, { CanceledError } from "../services/posts-service"

function PostList() {
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
        <div className="max-w-2xl mx-auto py-4">
            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
                {posts.map((post, index) => (
                    <div 
                        key={index}
                        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200"
                    >
                        <div className="p-6">
                            <Post post={post} />
                        </div>
                    </div>
                ))}
                
                {/* Empty State */}
                {posts.length === 0 && !error && (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md border border-gray-200">
                        <p className="text-gray-500 text-lg">No posts to display yet</p>
                        <p className="text-gray-400 mt-1">Check back later for updates!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PostList