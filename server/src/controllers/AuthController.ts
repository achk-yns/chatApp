import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../interfaces/user";
import User from "../models/user";
import { StatusCode } from "../enums/status-code.enum";
import { RequestWithUser } from "../interfaces/RequestWithUser";
import { StatutRequest } from "../enums/request-status.enum";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, mobile, password } = req.body;

  try {
    let user: IUser | null = await User.findOne({
      $or: [{ email }, { mobile }],
    });
    if (user) {
      res.status(StatusCode.CONFLICT).json({ msg: "User already exists" });
      return;
    }
    const Hash = await bcrypt.hash(password, 10);

    let UserCrated: IUser = await User.create({
      ...req.body,
      password: Hash,
    });
    const userResponse = UserCrated.toObject();
    delete userResponse.password;

    res.status(StatusCode.OK).send(userResponse);
  } catch (err) {
    const error = err as Error;
    console.error(error.message);

    res.status(StatusCode.ERROR).send("Server error");
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    let user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "Invalid credentials" });
      return;
    }

    jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;
        res.status(StatusCode.OK).send({ token });
      }
    );
  } catch (err) {
    const error = err as Error;
    console.error(error.message);
    res.status(StatusCode.ERROR).send("Server error");
  }
};

export const getOthersUsers = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?._id; // Use optional chaining to avoid runtime errors
    const users: IUser[] = await User.find({ _id: { $ne: id } });

    if (users.length === 0) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "No other users found" });
    }

    res.status(StatusCode.OK).json(users);
  } catch (error) {
    console.error("Error fetching other users:", error);
    res
      .status(StatusCode.ERROR)
      .json({ msg: "An error occurred while fetching users" });
  }
};

export const getFriends = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?._id; // Use optional chaining to avoid runtime errors
    const users = await User.findById(id).populate("friends" , "fullname email profile mobile");

    if (!users) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "No other users found" });
    }

    res.status(StatusCode.OK).json(users);
  } catch (error) {
    console.error("Error fetching other users:", error);
    res
      .status(StatusCode.ERROR)
      .json({ msg: "An error occurred while fetching users" });
  }
};

export const getRequests = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?._id; // Use optional chaining to avoid runtime errors
    const requests = await User.findById(id).populate(
      "requests.from",
      "fullname email profile mobile"
    );

    if (!requests) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "No requests" });
    }

    res.status(StatusCode.OK).json(requests);
  } catch (error) {
    console.error("Error fetching other users:", error);
    res
      .status(StatusCode.ERROR)
      .json({ msg: "An error occurred while fetching users" });
  }
};

export const SendRequest = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?._id;
    const { receiverId, message } = req.body;

    const receiver: IUser | null = await User.findById(receiverId);

    if (!receiver) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "Receiver not found" });
    }

    receiver?.requests.push({
      from: id as string,
      message,
      status: StatutRequest.PENDING,
    });
    await receiver?.save();

    res.status(StatusCode.OK).json({ msg: "Request sent successfully" });
  } catch (error) {
    console.error("Error sending request:", error);
    res
      .status(StatusCode.ERROR)
      .json({ msg: "An error occurred while sending the request" });
  }
};

export const AcceptRequest = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const id = req.user?._id;
    const { requestId } = req.body;

    const user: IUser | null = await User.findById(id);

    if (!user) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "User not found" });
    }
    const UpdateStatutRequest = await User.findByIdAndUpdate(
     id,
      {
        $pull: { requests: { from: requestId } },
      },
      { new: true }
    );

    if (!UpdateStatutRequest) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "Request  not found" });
    }
    await User.findByIdAndUpdate(id,{
      $push:{friends:requestId}
    })

    const friendUser = await User.findByIdAndUpdate(requestId,{
      $push:{friends:id}
    })

    if (!friendUser) {
      res.status(StatusCode.NOT_FOUND).json({ msg: "Friend  not found" });
    }

    res.status(StatusCode.OK).json({ msg: "Request Accepted successfully" });
  } catch (error) {
    console.error("Error sending request:", error);
    res
      .status(StatusCode.ERROR)
      .json({ msg: "An error occurred while sending the request" });
  }
};

export default {
  loginUser,
  registerUser,
  getOthersUsers,
  SendRequest,
  getRequests,
  getFriends,
  AcceptRequest,
};
