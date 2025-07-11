import { isValidObjectId } from 'mongoose';
import User from '../models/User.js';
import Lfg from '../models/lfg.js';

const getGroup = async (req, res) => {
  const group = await Lfg.find()
    .populate('userId', 'name') // Populate creator name
    .populate('attendess.userId', 'name'); // Populate attendee names
  res.json(group);
};

const createGroup = async (req, res) => {
  // Use userId from the verified token instead of request body
  const userId = req.userId;
  const { attendess } = req.sanitizedBody;

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

  // Override userId with the one from the token
  const groupData = { ...req.sanitizedBody, userId };
  const group = await Lfg.create(groupData);
  res.json(group);
};

const getGroupById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const group = await Lfg.findById(id)
    .populate('userId', 'name') // Populate creator name
    .populate('attendess.userId', 'name'); // Populate attendee names

  if (!group) throw new Error('Group not found', { cause: 404 });

  res.json(group);
};

const updateGroup = async (req, res) => {
  const { id } = req.params;
  // Use userId from the verified token instead of request body
  const userId = req.userId;
  const { attendess } = req.sanitizedBody;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  // First, check if the group exists and if the user owns it
  const existingGroup = await Lfg.findById(id);
  if (!existingGroup) {
    throw new Error('Group not found', { cause: 404 });
  }

  // Check if the user is the owner of the group
  if (existingGroup.userId.toString() !== userId) {
    return res.status(403).json({ error: 'You can only update your own activities' });
  }

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

  // Override userId with the one from the token
  const updateData = { ...req.sanitizedBody, userId };
  const group = await Lfg.findByIdAndUpdate(id, updateData, { new: true })
    .populate('userId', 'name')
    .populate('attendess.userId', 'name');

  if (!group) throw new Error('group not found', { cause: 404 });
  res.json(group);
};

const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // Get userId from the verified token

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  // First, check if the group exists and if the user owns it
  const existingGroup = await Lfg.findById(id);
  if (!existingGroup) {
    throw new Error('Group not found', { cause: 404 });
  }

  // Check if the user is the owner of the group
  if (existingGroup.userId.toString() !== userId) {
    return res.status(403).json({ error: 'You can only delete your own activities' });
  }

  const group = await Lfg.findByIdAndDelete(id);

  if (!group) throw new Error('Group not found', { cause: 404 });
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
};

const joinGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // Get userId from the verified token

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  // Check if the group exists
  const group = await Lfg.findById(id);
  if (!group) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  // Check if user is trying to join their own activity
  if (group.userId.toString() === userId) {
    return res.status(400).json({ error: 'You cannot join your own activity' });
  }

  // Check if user is already in the attendees list
  const existingAttendee = group.attendess.find(attendee => attendee.userId.toString() === userId);
  if (existingAttendee) {
    return res
      .status(400)
      .json({ error: `You have already requested to join this activity (Status: ${existingAttendee.status})` });
  }

  // Check if the activity has reached its attendee limit
  if (group.attendeessLimit && group.attendess.length >= group.attendeessLimit) {
    return res.status(400).json({ error: 'This activity has reached its attendee limit' });
  }

  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Add user to attendees list with "pending" status
  group.attendess.push({
    userId: userId,
    status: 'pending'
  });

  await group.save();

  // Populate user data before returning
  const populatedGroup = await Lfg.findById(id).populate('userId', 'name').populate('attendess.userId', 'name');

  res.json({
    message: 'Join request sent successfully',
    status: 'pending',
    activity: populatedGroup
  });
};

const leaveGroup = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId; // Get userId from the verified token

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  // Check if the group exists
  const group = await Lfg.findById(id);
  if (!group) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  // Check if user is in the attendees list
  const attendeeIndex = group.attendess.findIndex(attendee => attendee.userId.toString() === userId);
  if (attendeeIndex === -1) {
    return res.status(400).json({ error: 'You are not part of this activity' });
  }

  // Remove user from attendees list
  group.attendess.splice(attendeeIndex, 1);

  await group.save();

  // Populate user data before returning
  const populatedGroup = await Lfg.findById(id).populate('userId', 'name').populate('attendess.userId', 'name');

  res.json({
    message: 'Successfully left the activity',
    activity: populatedGroup
  });
};

const updateAttendeeStatus = async (req, res) => {
  const { id, attendeeId } = req.params;
  const { status } = req.body;
  const userId = req.userId; // Get userId from the verified token

  if (!isValidObjectId(id) || !isValidObjectId(attendeeId)) {
    throw new Error('Invalid id', { cause: 400 });
  }

  if (!['pending', 'approved', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be: pending, approved, or declined' });
  }

  // Check if the group exists
  const group = await Lfg.findById(id);
  if (!group) {
    return res.status(404).json({ error: 'Activity not found' });
  }

  // Check if the user is the owner of the group
  if (group.userId.toString() !== userId) {
    return res.status(403).json({ error: 'Only the activity owner can manage attendee requests' });
  }

  // Find the attendee to update
  const attendee = group.attendess.find(att => att.userId.toString() === attendeeId);
  if (!attendee) {
    return res.status(404).json({ error: 'Attendee not found in this activity' });
  }

  // Update the status
  attendee.status = status;

  await group.save();

  // Populate user data before returning
  const populatedGroup = await Lfg.findById(id).populate('userId', 'name').populate('attendess.userId', 'name');

  res.json({
    message: `Attendee status updated to ${status}`,
    activity: populatedGroup
  });
};

export {
  getGroup,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupByUserId,
  joinGroup,
  leaveGroup,
  updateAttendeeStatus
};
