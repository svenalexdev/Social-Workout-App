import { isValidObjectId } from 'mongoose';
import User from '../models/User.js';
import Lfg from '../models/lfg.js';

const getGroup = async (req, res) => {
  const group = await Lfg.find();
  res.json(group);
};

const createGroup = async (req, res) => {
  const { userId, attendess } = req.sanitizedBody;

  const found = await User.findById(userId);
  if (!found) {
    return res.status(401).json({ error: 'User not found' });
  }

  if (attendess && attendess.length > 0) {
    const attendeeUserIds = attendess.map(attendee => attendee.userId);
    const existingUsers = await User.find({ _id: { $in: attendeeUserIds } });
    
    if (existingUsers.length !== attendeeUserIds.length) {
      return res.status(401).json({ error: 'One or more attendees not found' });
    }
  }
  
  const group = await Lfg.create(req.sanitizedBody);
  res.json(group);
};

const getGroupById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const group = await Lfg.findById(id);

  if (!group) throw new Error('Group not found', { cause: 404 });

  res.json(group);
};

const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { userId, attendess } = req.sanitizedBody;
  
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  // Check if the main user exists
  const found = await User.findById(userId);
  if (!found) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Check if all attendees users exist
  if (attendess && attendess.length > 0) {
    const attendeeUserIds = attendess.map(attendee => attendee.userId);
    const existingUsers = await User.find({ _id: { $in: attendeeUserIds } });
    
    if (existingUsers.length !== attendeeUserIds.length) {
      return res.status(401).json({ error: 'One or more attendees not found' });
    }
  }

  const group = await Lfg.findByIdAndUpdate(id, req.sanitizedBody, { new: true });

  if (!group) throw new Error('group not found', { cause: 404 });
  res.json(group);
};

const deleteGroup = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const group = await Lfg.findByIdAndDelete(id);

  if (!group) throw new Error('Group not foumd', { cause: 404 });
  res.json({ message: 'Group deleted' });
};

const getGroupByUserId = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const userExists = await User.findById(id);
  if (!userExists) {
    return res.status(404).json({ error: 'User not found' });
  }

  const groups = await Lfg.find({ userId: id });

  res.json({ userId: id, groups });
}

export { getGroup, createGroup, getGroupById, updateGroup, deleteGroup,getGroupByUserId };
