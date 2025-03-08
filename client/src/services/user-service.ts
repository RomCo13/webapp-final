import { CredentialResponse } from "@react-oauth/google"
import apiClient from "./api-client"

export interface IUser {
    email: string,
    password?: string,
    imgUrl?: string,
    _id?: string,
    accessToken?: string,
    refreshToken?: string
}

export const registrUser = (user: IUser) => {
    return new Promise<IUser>((resolve, reject) => {
        console.log("Registering user...")
        console.log(user)
        apiClient.post("/auth/register", user).then((response) => {
            console.log(response)
            localStorage.setItem('authToken', response.data.accessToken);
            resolve(response.data)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })
    })
}

export const loginUser = (user: Partial<IUser>) => {
    return new Promise<IUser>((resolve, reject) => {
        console.log("Logging in user...")
        console.log(user)
        apiClient.post("/auth/login", user).then((response) => {
            console.log(response)
            localStorage.setItem('authToken', response.data.accessToken);
            resolve(response.data)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })
    })
}
export const googleSignin = (credentialResponse: CredentialResponse) => {
    return new Promise<IUser>((resolve, reject) => {
        console.log("googleSignin ...")
        apiClient.post("/auth/google", credentialResponse).then((response) => {
            console.log(response)
            resolve(response.data)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })
    })
}

export const editProfile = (updates: Partial<IUser>) => {
    return new Promise<IUser>((resolve, reject) => {
        console.log("Editing profile...")
        console.log(updates)
        
        // Get the token from localStorage
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            reject(new Error("No authentication token found"));
            return;
        }

        apiClient.put("/auth/edit", updates, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        }).then((response) => {
            console.log(response)
            resolve(response.data)
        }).catch((error) => {
            console.log(error)
            reject(error)
        })
    })
}