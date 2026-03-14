import express from 'express';
import { agentLocation, getOrder } from '../controllers/agentControllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();
router.post('/location' ,verifyToken, agentLocation);
router.get('/getOrder/:id',verifyToken,getOrder)
export default router;
