import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv"
let conn: any = null;

dotenv.config()

export const connectDatabase = async (): Promise<Connection> => {
  if (conn === null) {
    console.log("Creating new connection to the database....");
    conn = await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000,
      dbName: process.env.DB_NAME_PROD,
    });
    return conn;
  }
  console.log(
    "Connection already established, reusing the existing connection"
  );
  return conn;
};

