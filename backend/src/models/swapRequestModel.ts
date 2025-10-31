import mongoose from "mongoose";

export interface SwapRequestInterface {
    _id?: mongoose.ObjectId;
    mySlotId: mongoose.ObjectId;
    theirSlotId: mongoose.ObjectId;
    requesterId: mongoose.ObjectId;
    recipientId: mongoose.ObjectId;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt?: Date;
    updatedAt?: Date;
}

const swapRequestSchema = new mongoose.Schema<SwapRequestInterface>({
    mySlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    theirSlotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    }
}, {
    timestamps: true
});

export const SwapRequest = mongoose.model("SwapRequest", swapRequestSchema);