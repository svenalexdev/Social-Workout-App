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

  const found = await Plan.findById(planId);

  if (!found) throw new Error('UserId or PlanId not found', { cause: 401 });
  const logs = await Log.create(req.sanitizedBody);
  res.json(logs);
};

const getLogById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const logs = await Log.findById(id);

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

export { getLog, createLog, getLogById, updateLog, deleteLog };
