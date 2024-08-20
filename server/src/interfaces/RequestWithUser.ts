import { Request } from "express";
import { IUser } from "./user";

export interface RequestWithUser extends Request {
    user:IUser;
}