import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from './models/message';
import User from './models/user';
import { IUser } from './interfaces/user';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Define the type for userSocketMap
interface UserSocketMap {
  [key: string]: string; // Key is userId and value is socketId
}

export const initializeWebSocket = (io: SocketIOServer) => {
  const userSocketMap: UserSocketMap = {}; // Initialize the userSocketMap with correct type

  io.on('connection', (socket) => {
    console.log('A user is connected', socket.id);
  
    const userId = socket.handshake.query.userId as string;
  
    if (userId) {
      userSocketMap[userId] = socket.id;
    }
  
    console.log('User socket data', userSocketMap);
  
    socket.on('sendMessage', async (data) => {
      const { senderId, receiverId, message } = data;
      console.log('Received sendMessage event with data:', data);
  
      // Emit the message to the receiver if connected
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        console.log('Emitting newMessage event to the receiver:', receiverId);
        io.to(receiverSocketId).emit('newMessage', {
          senderId,
          receiverId,
          message,
        });
      } else {
        console.log('Receiver socket ID not found for user:', receiverId);
      }
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
      delete userSocketMap[userId];
    });
  });
};
