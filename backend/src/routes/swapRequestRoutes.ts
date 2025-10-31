import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
    createSwapRequest,
    getSwapRequests,
    respondToSwapRequest
} from '../controllers/swapRequestControllers';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/swap-request - Create swap request
router.post('/', createSwapRequest);

// GET /api/swap-requests - Get all swap requests
router.get('/', getSwapRequests);

// POST /api/swap-response/:requestId - Respond to swap request
router.post('/:requestId', respondToSwapRequest);

export default router;