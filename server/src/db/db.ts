import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv"
let conn: any = null;

dotenv.config()

export const connectDatabase = async (): Promise<Connection> => {
  if (conn === null) {
    console.log("Creating new connection to the database....",process.env.MONGO_URI!);
    conn = await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 10000,
      dbName: process.env.DB_NAME_PROD,
    });
    return conn;
  }
  console.log(
    "Connection already established, reusing the existing connection"
  );
  return conn;
};

