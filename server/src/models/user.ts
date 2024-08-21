
import mongoose, { Schema } from 'mongoose';
import { IUser } from '../interfaces/user';
import { UserSTATUS } from '../enums/user-status.enum';
import { UserRoles } from '../enums/user-roles.enum';
import { LangEnum } from '../enums/lang-enum';
import { StatutRequest } from '../enums/request-status.enum';


const UserSchema: Schema = new Schema({
  fullname: {
    type: String,
    required: true,
  },
  profile:{
    type:String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  sexe: {
    type: String,
  },
  Lang: {
    type: String,
    enum: Object.values(LangEnum)
  },
  Role: {
    type: String,
    enum: Object.values(UserRoles),
    default:UserRoles.CUSTOMER
  },
  status: {
    type: Number,
    enum: [
      UserSTATUS.DELETED,
      UserSTATUS.BANNED,
      UserSTATUS.INACTIVE,
      UserSTATUS.ACTIVE,
      UserSTATUS.SUSPENDED,
    ],
    default: UserSTATUS.INACTIVE,
  },
  requests:[{
    from:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
      require:true
    },
    message:{
      type:String,
      require:true
    },
    status:{
      type:String,
      enum:[
      StatutRequest.PENDING,
      StatutRequest.ACCEPTED,
      StatutRequest.REJECTED
      ],
      default:StatutRequest.PENDING
    }
  }],
  friends:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }]
},{
    timestamps: true,
    
  });

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
