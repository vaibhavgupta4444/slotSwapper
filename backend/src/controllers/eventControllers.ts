import { Request, Response } from 'express';
import { Event } from '../models/eventModel';

interface AuthRequest extends Request {
    user?: any;
}

// Get all events for the logged-in user
export const getEvents = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;

        let filter: any = { userId };
        if (status) {
            filter.status = status;
        }

        const events = await Event.find(filter).sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            success: true,
            events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch events'
        });
    }
};

// Create a new event
export const createEvent = async (req: AuthRequest, res: Response) => {
    try {
        const { title, date, startTime, endTime, description } = req.body;
        const userId = req.user._id;

        if (!title || !date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'Title, date, start time, and end time are required'
            });
        }

        const newEvent = new Event({
            title,
            date,
            startTime,
            endTime,
            description,
            userId,
            status: 'BUSY'
        });

        const savedEvent = await newEvent.save();

        return res.status(201).json({
            success: true,
            event: savedEvent,
            message: 'Event created successfully'
        });
    } catch (error) {
        console.error('Error creating event:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create event'
        });
    }
};

// Update event status
export const updateEventStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        if (!['BUSY', 'SWAPPABLE'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be BUSY or SWAPPABLE'
            });
        }

        const event = await Event.findOne({ _id: id, userId });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.status === 'SWAP_PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update status of event with pending swap'
            });
        }

        event.status = status;
        const updatedEvent = await event.save();

        return res.status(200).json({
            success: true,
            event: updatedEvent,
            message: 'Event status updated successfully'
        });
    } catch (error) {
        console.error('Error updating event status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update event status'
        });
    }
};

// Get swappable slots from other users
export const getSwappableSlots = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        const swappableSlots = await Event.find({
            status: 'SWAPPABLE',
            userId: { $ne: userId } // Exclude current user's slots
        })
        .populate('userId', 'name email')
        .sort({ date: 1, startTime: 1 });

        return res.status(200).json({
            success: true,
            slots: swappableSlots
        });
    } catch (error) {
        console.error('Error fetching swappable slots:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch swappable slots'
        });
    }
};