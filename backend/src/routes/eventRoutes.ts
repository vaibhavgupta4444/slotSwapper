import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
    getEvents, 
    createEvent, 
    updateEventStatus
} from '../controllers/eventControllers';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/events - Get user's events
router.get('/', getEvents);

// POST /api/events - Create new event
router.post('/', createEvent);

// PUT /api/events/:id - Update event status
router.put('/:id', updateEventStatus);

export default router;