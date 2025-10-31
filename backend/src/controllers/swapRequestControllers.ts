import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SwapRequest } from '../models/swapRequestModel';
import { Event } from '../models/eventModel';

interface AuthRequest extends Request {
    user?: any;
}

// Create a swap request
export const createSwapRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { mySlotId, theirSlotId } = req.body;
        const requesterId = req.user._id;

        if (!mySlotId || !theirSlotId) {
            return res.status(400).json({
                success: false,
                message: 'Both mySlotId and theirSlotId are required'
            });
        }

        // Verify both slots exist and are swappable
        const [mySlot, theirSlot] = await Promise.all([
            Event.findById(mySlotId),
            Event.findById(theirSlotId)
        ]);

        if (!mySlot || !theirSlot) {
            return res.status(404).json({
                success: false,
                message: 'One or both slots not found'
            });
        }

        // Verify mySlot belongs to requester
        if (mySlot.userId.toString() !== requesterId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only offer your own slots'
            });
        }

        // Verify both slots are swappable
        if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
            return res.status(400).json({
                success: false,
                message: 'Both slots must be marked as SWAPPABLE'
            });
        }

        // Check if swap request already exists
        const existingRequest = await SwapRequest.findOne({
            $or: [
                { mySlotId, theirSlotId },
                { mySlotId: theirSlotId, theirSlotId: mySlotId }
            ],
            status: 'PENDING'
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'A swap request already exists for these slots'
            });
        }

        const recipientId = theirSlot.userId;

        // Create swap request
        const swapRequest = new SwapRequest({
            mySlotId: theirSlotId, // What the requester wants
            theirSlotId: mySlotId, // What the requester offers
            requesterId,
            recipientId
        });

        await Promise.all([
            Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' }),
            Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' }),
            swapRequest.save()
        ]);

        // Populate the swap request for the notification
        const populatedRequest = await SwapRequest.findById(swapRequest._id)
            .populate('mySlotId', 'title date startTime endTime description')
            .populate('theirSlotId', 'title date startTime endTime description')
            .populate('requesterId', 'name email')
            .populate('recipientId', 'name email');

        // Send real-time notification to the recipient
        if (global.socketService && populatedRequest) {
            global.socketService.sendSwapRequestNotification(recipientId.toString(), populatedRequest);
        }

        return res.status(201).json({
            success: true,
            swapRequest: populatedRequest,
            message: 'Swap request created successfully'
        });
    } catch (error) {
        console.error('Error creating swap request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create swap request'
        });
    }
};

// Get all swap requests for a user (both incoming and outgoing)
export const getSwapRequests = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const requests = await SwapRequest.find({
            $or: [
                { requesterId: userId },  // Outgoing requests (I sent)
                { recipientId: userId }   // Incoming requests (sent to me)
            ]
        })
        .populate('mySlotId', 'title date startTime endTime description')
        .populate('theirSlotId', 'title date startTime endTime description')
        .populate('requesterId', 'name email')
        .populate('recipientId', 'name email')
        .populate({
            path: 'mySlotId',
            populate: {
                path: 'userId',
                select: 'name email'
            }
        })
        .populate({
            path: 'theirSlotId',
            populate: {
                path: 'userId',
                select: 'name email'
            }
        })
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        console.error('Error fetching swap requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch swap requests'
        });
    }
};

// Respond to swap request
export const respondToSwapRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { requestId } = req.params;
        const { accepted } = req.body;
        const userId = req.user._id;

        if (typeof accepted !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'accepted field must be a boolean'
            });
        }

        const swapRequest = await SwapRequest.findById(requestId)
            .populate('mySlotId')
            .populate('theirSlotId');

        if (!swapRequest) {
            return res.status(404).json({
                success: false,
                message: 'Swap request not found'
            });
        }

        // Verify the user is the recipient
        if (swapRequest.recipientId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only respond to requests sent to you'
            });
        }

        // Check if request is still pending
        if (swapRequest.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'This request has already been responded to'
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            if (accepted) {
                // Accept the swap - exchange the owners
                const mySlot = swapRequest.mySlotId as any;
                const theirSlot = swapRequest.theirSlotId as any;

                // Swap the userIds
                await Promise.all([
                    Event.findByIdAndUpdate(mySlot._id, { 
                        userId: theirSlot.userId,
                        status: 'BUSY'
                    }, { session }),
                    Event.findByIdAndUpdate(theirSlot._id, { 
                        userId: mySlot.userId,
                        status: 'BUSY'
                    }, { session }),
                    SwapRequest.findByIdAndUpdate(requestId, { 
                        status: 'ACCEPTED' 
                    }, { session })
                ]);

                await session.commitTransaction();

                // Send real-time notification to the requester
                if (global.socketService) {
                    global.socketService.sendSwapResponseNotification(swapRequest.requesterId.toString(), {
                        accepted: true,
                        swapRequestId: requestId,
                        message: 'Your swap request has been accepted!'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Swap request accepted successfully'
                });
            } else {
                // Reject the swap - set slots back to SWAPPABLE
                await Promise.all([
                    Event.findByIdAndUpdate(swapRequest.mySlotId, { 
                        status: 'SWAPPABLE' 
                    }, { session }),
                    Event.findByIdAndUpdate(swapRequest.theirSlotId, { 
                        status: 'SWAPPABLE' 
                    }, { session }),
                    SwapRequest.findByIdAndUpdate(requestId, { 
                        status: 'REJECTED' 
                    }, { session })
                ]);

                await session.commitTransaction();

                // Send real-time notification to the requester
                if (global.socketService) {
                    global.socketService.sendSwapResponseNotification(swapRequest.requesterId.toString(), {
                        accepted: false,
                        swapRequestId: requestId,
                        message: 'Your swap request has been rejected.'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Swap request rejected'
                });
            }
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error responding to swap request:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to respond to swap request'
        });
    }
};