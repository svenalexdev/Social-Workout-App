import { isValidObjectId } from 'mongoose';
import User from '../models/User.js';
import * as bcrypt from 'bcrypt';

const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const createUser = async (req, res) => {
  const { email, password } = req.sanitizedBody;

  const found = await User.findOne({ email });

  if (found) throw new Error('Email already exist', { cause: 400 });

  const hashedpassword = await bcrypt.hash(password, 10);

  const user = await User.create({ ...req.sanitizedBody, password: hashedpassword });
  res.json(user);
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findById(id);

  if (!user) throw new Error('User not found', { cause: 404 });

  res.json(user);
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const user = await User.findByIdAndUpdate(id, req.sanitizedBody, {
    new: true
  });

  if (!user) throw new Error('User not found', { cause: 404 });

  res.json(user);
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error('User not found', { cause: 404 });

  res.json({ message: 'User deleted' });
};

 const uploadProfileImage = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const imageUrl = req.body.image;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL missing from request' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { image: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { getUsers, createUser, getUserById, updateUser, deleteUser, uploadProfileImage };
