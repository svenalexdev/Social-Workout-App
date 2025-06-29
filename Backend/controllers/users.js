import { isValidObjectId } from "mongoose";
import User from '../models/User.js'
import * as bcrypt from 'bcrypt';

const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const createUser = async (req, res) => {
  const { email,password } = req.sanitizedBody;

  const found = await User.findOne({ email });

  if (found) throw new Error("Email already exist", { cause: 400 });

  const hashedpassword =await bcrypt.hash(password,10);
  
  const user = await User.create({...req.sanitizedBody,password:hashedpassword});
  res.json(user);
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid id", { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error("User not found", { cause: 404 });

  res.json(user);
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error("Invalid id", { cause: 400 });

  const user = await User.findByIdAndUpdate(id, req.sanitizedBody, {
    new: true,
  });

  if (!user) throw new Error("User not found", { cause: 404 });

  res.json(user);
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error("Invalid id", { cause: 400 });
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error("User not found", { cause: 404 });

  res.json({ message: "User deleted" });
};

export { getUsers, createUser, getUserById, updateUser, deleteUser };
