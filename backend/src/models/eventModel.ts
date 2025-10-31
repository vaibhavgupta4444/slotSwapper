import mongoose from "mongoose";

export interface EventInterface {
    _id?: mongoose.ObjectId;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
    userId: mongoose.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const eventSchema = new mongoose.Schema<EventInterface>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
        default: 'BUSY'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export const Event = mongoose.model("Event", eventSchema);