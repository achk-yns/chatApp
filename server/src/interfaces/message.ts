import { Document } from "mongoose";

export interface IMessage extends Document {
    sender: string;
    recipient: string;
    content: string;
    conversationId: string; 
    timestamp: Date;
}
  