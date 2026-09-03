import express from 'express';
import { loginUser, logoutUser, registerUser, verifyAuth } from '../controllers/authControllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login',loginUser)
router.post('/logout',logoutUser)
router.get('/verify', verifyToken, verifyAuth);

export default router;