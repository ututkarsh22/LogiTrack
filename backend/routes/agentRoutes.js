import express from 'express';
import { agentLocation } from '../controllers/agentControllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();
router.post('/location' ,verifyToken, agentLocation);
export default router;
