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
    const req = apiClient.get<ApiResponse<PostData[]>>('studentpost', { signal: abortController.signal });
    return { req, abort: () => abortController.abort() };
};

export default { getAllPosts };