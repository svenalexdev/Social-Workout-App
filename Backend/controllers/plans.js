import { isValidObjectId } from 'mongoose';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import axios from 'axios';
import { planSchema } from '../zod/schemas.js';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const getHeaders = () => ({
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
});

const getPlan = async (req, res) => {
  const plans = await Plan.find();
  res.json(plans);
};

// Helper to enrich exercises by fetching from external API
async function enrichExercises(exercises) {
  return Promise.all(
    exercises.map(async ex => {
      if (!ex.exerciseId) return ex;

      try {
        const response = await axios.get(`${BASE_URL}/exercises/exercise/${ex.exerciseId}`, {
          headers: getHeaders()
        });

        const details = response.data;

        // Merge the plan exercise data with API details
        return {
          ...ex,
          name: details.name,
          description: details.description,
          gifUrl: details.gifUrl,
          target: details.target,
          equipment: details.equipment,
          bodyPart: details.bodyPart,
          secondaryMuscles: details.secondaryMuscles,
          instructions: details.instructions
        };
      } catch (error) {
        console.error(`Error fetching exercise details for ${ex.exerciseId}:`, error.message);
        // Return original exercise if API call fails
        return ex;
      }
    })
  );
}

const createPlan = async (req, res) => {
  const { userId, exercise } = req.sanitizedBody;
  const found = await User.findById(userId);
  if (!found) {
    return res.status(400).json({ message: 'User ID does not exist' });
  }
  // Enrich exercises before saving
  const enrichedExercises = await enrichExercises(exercise);
  const planToSave = { ...req.sanitizedBody, exercise: enrichedExercises };
  const plans = await Plan.create(planToSave);
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
  // Enrich exercises before updating
  const { exercise, ...rest } = req.sanitizedBody;
  let planToUpdate = { ...rest };
  if (exercise) {
    planToUpdate.exercise = await enrichExercises(exercise);
  }
  const plans = await Plan.findByIdAndUpdate(id, planToUpdate, { new: true });
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
