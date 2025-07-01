import { isValidObjectId } from 'mongoose';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import { planSchema } from '../zod/schemas.js';

const getPlan = async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
};

const createPlan = async (req, res) => {
  const { userId } = req.sanitizedBody;

  const found = await User.findById(userId);

  if (!found) {
    return res.status(400).json({ message: 'User ID does not exist' });
  }
  const plans = await Plan.create(req.sanitizedBody);
  res.json(plans);
};

const getPlanById = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const plans = await Plan.findById(id);

  if (!plans) throw new Error('Plan not found', { cause: 404 });
  res.json(plans);
};

const updatePlan = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const plans = await Plan.findByIdAndUpdate(id, req.sanitizedBody, { new: true });

  if (!plans) throw new Error('Plan not foumd', { cause: 404 });
  res.json(plans);
};

const deletePlan = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const plans = await Plan.findByIdAndDelete(id);

  if (!plans) throw new Error('Plan not found', { cause: 404 });

  res.json({ message: 'plans deleted' });
};

const getPlanByUserId = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  const plans = await Plan.find({ userId: id });
  // console.log(plans);

  if (!plans) throw new Error('plan not found', { cause: 404 });

   const Plans = plans.map(plan => {
    const planObj = plan.toObject();
    delete planObj.userId;
    return planObj;
  });

  res.json({
    userId: id,
    Plans
  });
};

export { getPlan, createPlan, getPlanById, updatePlan, deletePlan, getPlanByUserId };
