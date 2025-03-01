import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentPost extends Document {
    student: mongoose.Types.ObjectId;
    title: string;
    content: string;
    comments: mongoose.Types.ObjectId[]; // Array of ObjectId references to comments
    likes: mongoose.Types.ObjectId[]; // Array of ObjectId references to comments
    createdAt: Date;
    updatedAt: Date;
}

const studentPostSchema = new Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', // Store user IDs who liked the post
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const StudentPost = mongoose.model<IStudentPost>('StudentPost', studentPostSchema);