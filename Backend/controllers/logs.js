import { isValidObjectId } from 'mongoose';
import Log from '../models/Log.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';

const getLog = async (req, res) => {
  const logs = await Log.find();
  res.json(logs);
};

const createLog = async (req, res) => {
  const { planId } = req.sanitizedBody;
  const userId = req.userId; // Get userId from authenticated token

  // Validate that the plan exists
  const foundPlan = await Plan.findById(planId);
  if (!foundPlan) throw new Error('Plan not found', { cause: 404 });

  // Validate that the user exists
  const foundUser = await User.findById(userId);
  if (!foundUser) throw new Error('User not found', { cause: 404 });

  // Use authenticated userId instead of body userId
  const logData = { ...req.sanitizedBody, userId };
  const logs = await Log.create(logData);
  res.json(logs);
};

const getLogById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const logs = await Log.findById(id).populate('userId');

  if (!logs) throw new Error('User not found', { cause: 404 });

  res.json(logs);
};

const updateLog = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const logs = await Log.findByIdAndUpdate(id, req.sanitizedBody, { new: true });

  if (!logs) throw new Error('Plan not foumd', { cause: 404 });
  res.json(logs);
};

const deleteLog = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const logs = await Log.findByIdAndDelete(id);

  if (!logs) throw new Error('Plan not foumd', { cause: 404 });
  res.json({ message: 'Logs deleted' });
};

const getLogByUserId = async (req, res) => {
  const { id } = req.params;
  const authenticatedUserId = req.userId; // Get from token

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  // Ensure users can only access their own logs
  if (id !== authenticatedUserId) {
    throw new Error('Unauthorized: You can only access your own logs', { cause: 403 });
  }

  const logs = await Log.find({ userId: id });

  if (!logs) throw new Error('User id not found', { cause: 404 });

  const Logs = logs.map(log => {
    const logObj = log.toObject();
    delete logObj.userId;
    return logObj;
  });

  res.json({
    userId: id,
    Logs
  });
};
export { getLog, createLog, getLogById, updateLog, deleteLog, getLogByUserId };
