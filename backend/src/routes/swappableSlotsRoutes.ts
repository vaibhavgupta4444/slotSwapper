import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getSwappableSlots } from '../controllers/eventControllers';

const router = express.Router();

// Authentication required
router.use(authenticateToken);

// GET /api/swappable-slots - Get swappable slots from other users
router.get('/', getSwappableSlots);

export default router;