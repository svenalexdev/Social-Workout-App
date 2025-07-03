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

        // Ensure setDetails array exists and is properly structured
        let setDetails = ex.setDetails || [];

        // If no setDetails provided but we have old format (weight/reps), convert it
        if (setDetails.length === 0 && ex.weight && ex.reps && ex.sets) {
          setDetails = Array.from({ length: ex.sets }, (_, index) => ({
            setNumber: index + 1,
            weight: ex.weight,
            reps: ex.reps
          }));
        }

        // Create exerciseDetails array with API data
        const exerciseDetails = [
          {
            name: details.name,
            description: details.description,
            gifUrl: details.gifUrl,
            target: details.target,
            equipment: details.equipment,
            bodyPart: details.bodyPart,
            secondaryMuscles: details.secondaryMuscles,
            instructions: details.instructions
          }
        ];

        // Return exercise with setDetails and exerciseDetails structure
        return {
          ...ex,
          setDetails,
          exerciseDetails
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

// Update plan based on workout session results
const updatePlanFromWorkout = async (req, res) => {
  const { id } = req.params; // Plan ID
  const { completedSets, exerciseUpdates } = req.body;

  if (!isValidObjectId(id)) throw new Error('Invalid id', { cause: 400 });

  try {
    const plan = await Plan.findById(id);
    if (!plan) throw new Error('Plan not found', { cause: 404 });

    // Update setDetails based on workout performance
    if (exerciseUpdates && Array.isArray(exerciseUpdates)) {
      exerciseUpdates.forEach(update => {
        const exerciseIndex = plan.exercise.findIndex(ex => ex.exerciseId === update.exerciseId);
        if (exerciseIndex !== -1) {
          // Update specific sets based on completed workout
          update.setUpdates.forEach(setUpdate => {
            const setIndex = plan.exercise[exerciseIndex].setDetails.findIndex(
              set => set.setNumber === setUpdate.setNumber
            );
            if (setIndex !== -1) {
              plan.exercise[exerciseIndex].setDetails[setIndex].weight = setUpdate.weight;
              plan.exercise[exerciseIndex].setDetails[setIndex].reps = setUpdate.reps;
            }
          });
        }
      });
    }

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating plan from workout:', error);
    res.status(500).json({ error: 'Failed to update plan from workout results' });
  }
};

export { getPlan, createPlan, getPlanById, updatePlan, deletePlan, getPlanByUserId, updatePlanFromWorkout };
