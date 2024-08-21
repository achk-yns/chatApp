import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import ioClient, { Socket } from 'socket.io-client';
import mongoose, { Types, Document } from 'mongoose';
import { app, server as expressServer } from '../src/server';
import User from '../src/models/user';
import Message from '../src/models/message';
import { AddressInfo } from 'net';
import { IMessage } from '../src/interfaces/message';

let io: SocketIOServer;
let httpServer: HttpServer;
let user1Socket: Socket;
let user2Socket: Socket;

let user1Id: Types.ObjectId;
let user2Id: Types.ObjectId;

jest.setTimeout(60000); // Increase Jest timeout for long-running tests

beforeAll(async () => {
  try {
    console.log("Establishing database connection...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Database connected.");

    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
      console.log("Database dropped.");
    }

    httpServer = new HttpServer(app);
    io = new SocketIOServer(httpServer);

    require('../src/websocket').initializeWebSocket(io);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        const port = (httpServer.address() as AddressInfo).port;

        user1Id = new Types.ObjectId();
        user2Id = new Types.ObjectId();

        user1Socket = ioClient(`http://localhost:${port}`, {
          query: { userId: user1Id.toHexString() },
        });
        user2Socket = ioClient(`http://localhost:${port}`, {
          query: { userId: user2Id.toHexString() },
        });

        user1Socket.on('connect', () => {
          user2Socket.on('connect', resolve);
        });
      });
    });
  } catch (error) {
    console.error("Error in beforeAll:", error);
    throw error;
  }
});

beforeEach(async () => {
  try {
    // Ensure unique ObjectIds for each test run
    user1Id = new Types.ObjectId();
    user2Id = new Types.ObjectId();

    // Create users in the database with unique mobile numbers for each test run
    await User.create([
      { 
        _id: user1Id, 
        email: `user1_${Date.now()}@example.com`, 
        password: 'password123', 
        mobile: `${Math.floor(Math.random() * 1000000000)}`, 
        fullname: 'User One',
        friends: [] 
      },
      { 
        _id: user2Id, 
        email: `user2_${Date.now()}@example.com`, 
        password: 'password123', 
        mobile: `${Math.floor(Math.random() * 1000000000)}`, 
        fullname: 'User Two',
        friends: [] 
      }
    ]);
  } catch (error) {
    console.error("Error in beforeEach:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (user1Socket) user1Socket.close();
    if (user2Socket) user2Socket.close();
    if (io) io.close();
    await new Promise<void>((resolve) => {
      if (httpServer) {
        httpServer.close(() => {
          expressServer.close(async () => {
            await mongoose.connection.close();
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  } catch (error) {
    console.error("Error in afterAll:", error);
  }
});

describe('Real-time messaging and friend requests', () => {
  it('should allow user1 to send a message to user2', (done) => {
    user2Socket.on('newMessage', (message: any) => {
      try {
        expect(message.senderId).toBe(user1Id.toHexString());
        expect(message.message).toBe('Hello, user2!');
        done();
      } catch (error) {
        done(error);
      }
    });

    user1Socket.emit('sendMessage', {
      senderId: user1Id.toHexString(),
      receiverId: user2Id.toHexString(),
      message: 'Hello, user2!',
    });
  });

  it('should persist the message in the database', async () => {
    // Delay to ensure the message is saved before the query is run
    await new Promise((resolve) => setTimeout(resolve, 500));

    const messageDoc = await Message.findOne({
      senderId: user1Id,
      receiverId: user2Id,
    }) as Document<unknown, {}, IMessage> & IMessage;

    expect(messageDoc).not.toBeNull();
    expect(messageDoc?.message).toBe('Hello, user2!');
  });

  it('should allow user1 to send a friend request to user2', async () => {
    const response = await new Promise((resolve) => {
      user1Socket.emit('sendFriendRequest', {
        receiverId: user2Id.toHexString(),
        message: "Let's be friends!",
      }, resolve);
    });

    expect(response).toEqual({ msg: 'Request sent successfully' });

    const user2 = await User.findById(user2Id);
    expect(user2?.requests).toHaveLength(1);
    expect(user2?.requests[0].from.toString()).toBe(user1Id.toHexString());
  });

  it('should allow user2 to accept the friend request from user1', async () => {
    const response = await new Promise((resolve) => {
      user2Socket.emit('acceptFriendRequest', {
        requestId: user1Id.toHexString(),
      }, resolve);
    });

    expect(response).toEqual({ msg: 'Request Accepted successfully' });

    const user1 = await User.findById(user1Id);
    const user2 = await User.findById(user2Id);

    expect(user1?.friends).toContainEqual(user2Id);
    expect(user2?.friends).toContainEqual(user1Id);
  });
});
