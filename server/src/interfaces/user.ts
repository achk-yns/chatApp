import { Document } from "mongoose";

export interface IUser extends Document {
    _id?:string;
    fullname: string;
    profile:string;
    email: string;
    mobile: string;
    sexe:string;
    Lang:string;
    password: string;
    Role:string;
    status:number;
    requests:[{
        from:string,
        message:string,
        status:string
      }];
    friends:string[];
}