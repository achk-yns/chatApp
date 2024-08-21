import { Request, Response } from 'express';
import Message from '../models/message';
import { IMessage } from '../interfaces/message';
import { StatusCode } from '../enums/status-code.enum';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';

// Create a new message
export const createMessage = async (req: Request, res: Response): Promise<void> => {
  const { senderId, recipientId, content } = req.body;

  // Generate a conversationId based on senderId and recipientId
  const conversationId = [senderId, recipientId].sort().join('_');

  try {
    const newMessage: IMessage = new Message({
      sender: senderId,
      recipient: recipientId,
      content: content,
      conversationId: conversationId,
    });

    await newMessage.save();

    res.status(StatusCode.CREATED).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(StatusCode.ERROR).json({ msg: 'Failed to create message' });
  }
};

// Get all messages for a conversation
export const getMessagesForConversation = async (req: Request, res: Response): Promise<void> => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });

    if (!messages || messages.length === 0) {
      res.status(StatusCode.NOT_FOUND).json({ msg: 'No messages found for this conversation' });
      return;
    }

    res.status(StatusCode.OK).json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(StatusCode.ERROR).json({ msg: 'Failed to retrieve messages' });
  }
};


export const SendMessage = (userSocketMap: Record<string, string>, io: SocketIOServer) => async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { senderId, receiverId, message } = req.body;

    const newMessage = new Message({
      senderId: new mongoose.Types.ObjectId(senderId),
      receiverId: new mongoose.Types.ObjectId(receiverId),
      message,
    });

    await newMessage.save();
    console.log('Message saved in DB:', newMessage);  // Add this line for debugging

    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ msg: 'Failed to send message' });
  }
};

export const getMessages =  async (req: Request, res: Response): Promise<void> => {
  try {
    const {senderId, receiverId} = req.query;

    const messages = await Message.find({
      $or: [
        {senderId: senderId, receiverId: receiverId},
        {senderId: receiverId, receiverId: senderId},
      ],
    }).populate('senderId', '_id name');

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error', error);
  }
}
