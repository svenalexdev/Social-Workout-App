import axios from 'axios';
import Exercise from '../models/Exercise.js';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
const BASE_URL = `https://${RAPIDAPI_HOST}`;

const getHeaders = () => ({
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
});

// export const getAllExercises = async (req, res) => {
//   try {
//     const response = await axios.get(`${BASE_URL}/exercises`, {
//       headers: getHeaders()
//     });
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching all exercises:', error.message);
//     res.status(500).json({
//       error: 'Failed to fetch exercises',
//       message: error.response?.data?.message || error.message
//     });
//   }
// };

export const getExercisesBe = async (req, res) => {
  const exercise = await Exercise.find();
  res.json(exercise);
};

export const getExerciseByName = async (req, res) => {
  try {
    const { name } = req.params;
    const response = await axios.get(`${BASE_URL}/exercises/name/${name}`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exercise by name:', error.message);
    res.status(500).json({
      error: 'Failed to fetch exercise by name',
      message: error.response?.data?.message || error.message
    });
  }
};

export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find exercise by exerciseId in MongoDB
    const exercise = await Exercise.findOne({ exerciseId: id });

    if (!exercise) {
      return res.status(404).json({
        error: 'Exercise not found',
        message: `No exercise found with exerciseId: ${id}`
      });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise by ID:', error.message);
    res.status(500).json({
      error: 'Failed to fetch exercise by ID',
      message: error.message
    });
  }
};

// export const getExerciseById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await axios.get(`${BASE_URL}/exercises/exercise/${id}`, {
//       headers: getHeaders()
//     });
//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching exercise by ID:', error.message);
//     res.status(500).json({
//       error: 'Failed to fetch exercise by ID',
//       message: error.response?.data?.message || error.message
//     });
//   }
// };

export const getExercisesByTarget = async (req, res) => {
  try {
    const { target } = req.params;
    const response = await axios.get(`${BASE_URL}/exercises/target/${target}`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exercises by target:', error.message);
    res.status(500).json({
      error: 'Failed to fetch exercises by target',
      message: error.response?.data?.message || error.message
    });
  }
};

export const getExercisesByEquipment = async (req, res) => {
  try {
    const { type } = req.params;
    const response = await axios.get(`${BASE_URL}/exercises/equipment/${type}`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exercises by equipment:', error.message);
    res.status(500).json({
      error: 'Failed to fetch exercises by equipment',
      message: error.response?.data?.message || error.message
    });
  }
};

export const getExercisesByBodyPart = async (req, res) => {
  try {
    const { bodyPart } = req.params;
    const response = await axios.get(`${BASE_URL}/exercises/bodyPart/${bodyPart}`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exercises by body part:', error.message);
    res.status(500).json({
      error: 'Failed to fetch exercises by body part',
      message: error.response?.data?.message || error.message
    });
  }
};

export const getBodyPartList = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/exercises/bodyPartList`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching body part list:', error.message);
    res.status(500).json({
      error: 'Failed to fetch body part list',
      message: error.response?.data?.message || error.message
    });
  }
};

export const getEquipmentList = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/exercises/equipmentList`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching equipment list:', error.message);
    res.status(500).json({
      error: 'Failed to fetch equipment list',
      message: error.response?.data?.message || error.message
    });
  }
};

export const getTargetList = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/exercises/targetList`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching target list:', error.message);
    res.status(500).json({
      error: 'Failed to fetch target list',
      message: error.response?.data?.message || error.message
    });
  }
};

// Sync function to fetch fresh data from API and update MongoDB
export const syncExercisesFromApi = async (req, res) => {
  try {
    console.log('Starting exercise data synchronization...');

    // Fetch fresh data from external API
    const response = await axios.get(`${BASE_URL}/exercises?limit=0&offset=0`, {
      headers: getHeaders()
    });

    const freshExercises = response.data;
    console.log(`Fetched ${freshExercises.length} exercises from API`);

    // Clear existing data
    await Exercise.deleteMany({});
    console.log('Cleared existing exercises from database');

    // Transform API data to match our Exercise model
    const transformedExercises = freshExercises.map(exercise => ({
      exerciseId: exercise.id, // Map 'id' from API to 'exerciseId' for our model
      name: exercise.name,
      description: exercise.description || '',
      gifUrl: exercise.gifUrl,
      target: exercise.target,
      equipment: exercise.equipment,
      bodyPart: exercise.bodyPart,
      secondaryMuscles: exercise.secondaryMuscles || [],
      instructions: exercise.instructions || []
    }));

    // Insert fresh data in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < transformedExercises.length; i += batchSize) {
      const batch = transformedExercises.slice(i, i + batchSize);
      await Exercise.insertMany(batch);
      insertedCount += batch.length;
      console.log(`Inserted batch: ${insertedCount}/${transformedExercises.length}`);
    }

    console.log(`Successfully inserted ${insertedCount} fresh exercises into database`);

    if (res) {
      res.json({
        success: true,
        message: `Successfully synchronized ${insertedCount} exercises`,
        count: insertedCount
      });
    }

    return { success: true, count: insertedCount };
  } catch (error) {
    console.error('Error synchronizing exercises:', error.message);
    console.error('Full error:', error);

    if (res) {
      res.status(500).json({
        error: 'Failed to synchronize exercises',
        message: error.response?.data?.message || error.message
      });
    }

    throw error;
  }
};
