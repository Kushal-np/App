import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
    title: string;
    description: string;
    instructor: mongoose.Types.ObjectId;
    students: mongoose.Types.ObjectId[];
    category?: string;
    thumbnailUrl: string;
    videoUrls: string[];
    createdAt: Date;
    updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    category: {
        type: String,
    },
    thumbnailUrl: {
        type: String,
    },
    videoUrls: [
        {
            type: String,
            required: true
        }
    ]
}, {
    timestamps: true
})

const Course = mongoose.model<ICourse>("Coures" , courseSchema);
export default Course ; 