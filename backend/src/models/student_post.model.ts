import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentPost extends Document {
    student: mongoose.Types.ObjectId;
    title: string;
    content: string;
    comments: mongoose.Types.ObjectId[]; // Array of ObjectId references to comments
    createdAt: Date;
    updatedAt: Date;
}

const studentPostSchema = new Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
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
                ref: 'Comment', // Reference to the Comment model
                required: false,
            },
        ],
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

export const StudentPost = mongoose.model<IStudentPost>('StudentPost', studentPostSchema);