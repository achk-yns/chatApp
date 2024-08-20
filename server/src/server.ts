import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { connectDatabase } from './db/db';
import { initializeWebSocket } from './websocket'; // Import the WebSocket handler
import messageRoutes from "./routes/message.routes"
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes); // Message routes

// Initialize WebSocket
initializeWebSocket(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await connectDatabase();
  console.log(`Server is running at http://localhost:${PORT}`);
});
