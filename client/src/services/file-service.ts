import apiClient from "./api-client";

interface IUploadResponse {
    url: string;
}
export const uploadPhoto = async (photo: File): Promise<string> => {
    console.log("Uploading photo...", photo);
    const formData = new FormData();
    
    if (!photo) {
        throw new Error("No photo provided");
    }
    
    formData.append("file", photo);
    
    try {
        const response = await apiClient.post<IUploadResponse>("file", formData, {
            headers: {
                // Let the browser set the correct Content-Type for the FormData
                // which will include the boundary parameter needed for multipart/form-data
            }
        });
        console.log(response);
        return response.data.url;
    } catch (err) {
        console.error("Error uploading file:", err);
        throw err;
    }
}

