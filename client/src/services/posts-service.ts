// posts-service.ts
import apiClient, { CanceledError } from "./api-client";
import { PostData } from "../components/Post";

// Define the API response structure
export interface ApiResponse<T> {
    status: string;
    data: T;
}

export { CanceledError };

const getAllPosts = () => {
    const abortController = new AbortController();
    const req = apiClient.get<ApiResponse<PostData[]>>('studentpost', { 
        signal: abortController.signal 
    });
    return { req, abort: () => abortController.abort() };
};

const createPost = (post: PostData, token: string) => {
    return apiClient.post<ApiResponse<PostData>>('/studentpost', post, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
};

export default { 
    getAllPosts,
    createPost 
};