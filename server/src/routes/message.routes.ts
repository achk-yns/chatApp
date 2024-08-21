import { Router } from 'express';
import { createMessage, getMessagesForConversation , SendMessage,getMessages } from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';
import { Server as SocketIOServer } from 'socket.io';


export default (io: SocketIOServer, userSocketMap: Record<string, string>) => {
    const router = Router();
  
    // Route to create a new message
    router.post('/', authMiddleware, createMessage);

    // Route to get all messages for a specific conversation
    router.get('/:conversationId', authMiddleware, getMessagesForConversation);
    
    
    router.post('/sendMessage', SendMessage(userSocketMap, io));
      
    router.get('/messages',getMessages);
    
  
    return router;
  };