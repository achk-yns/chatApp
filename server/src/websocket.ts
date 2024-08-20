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

  io.on('connection', (socket: Socket) => {
    console.log('A user is connected', socket.id);

    const userId = socket.handshake.query.userId as string | undefined;

    if (userId && userId !== 'undefined') {
      userSocketMap[userId] = socket.id;
    }

    console.log('User socket data', userSocketMap);

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
      if (userId) {
        delete userSocketMap[userId];
      }
    });

    socket.on('sendMessage', ({ senderId, receiverId, message }) => {
      const receiverSocketId = userSocketMap[receiverId];

      console.log('Receiver Id', receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receiveMessage', {
          senderId,
          message,
        });
      }
    });
  });
};
