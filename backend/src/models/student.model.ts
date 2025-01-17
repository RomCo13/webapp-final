import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
    // Add your student properties here
    name: string;
    email: string;
}

const studentSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
}, {
    timestamps: true
});

export const Student = mongoose.model<IStudent>('Student', studentSchema); 