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
    const response = await axios.get(`${BASE_URL}/exercises/exercise/${id}`, {
      headers: getHeaders()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exercise by ID:', error.message);
    res.status(500).json({
      error: 'Failed to fetch exercise by ID',
      message: error.response?.data?.message || error.message
    });
  }
};

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
