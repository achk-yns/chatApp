import { Router } from 'express';
import { createMessage, getMessagesForConversation } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Route to create a new message
router.post('/', authMiddleware, createMessage);

// Route to get all messages for a specific conversation
router.get('/:conversationId', authMiddleware, getMessagesForConversation);

export default router;
