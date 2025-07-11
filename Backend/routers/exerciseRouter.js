import { Router } from 'express';
import {
  // getAllExercises,
  getExerciseByName,
  getExerciseById,
  getExercisesByTarget,
  getExercisesByEquipment,
  getExercisesByBodyPart,
  getBodyPartList,
  getEquipmentList,
  getTargetList,
  getExercisesBe,
  getExercisesMinimal,
  syncExercisesFromApi
} from '../controllers/exercises.js';

const exerciseRouter = Router();

// exerciseRouter.get('/', getAllExercises);
exerciseRouter.get('/', getExercisesBe);
exerciseRouter.get('/minimal', getExercisesMinimal);
exerciseRouter.get('/name/:name', getExerciseByName);
exerciseRouter.get('/exercise/:id', getExerciseById);
exerciseRouter.get('/target/:target', getExercisesByTarget);
exerciseRouter.get('/equipment/:type', getExercisesByEquipment);
exerciseRouter.get('/bodyPart/:bodyPart', getExercisesByBodyPart);
exerciseRouter.get('/bodyPartList', getBodyPartList);
exerciseRouter.get('/equipmentList', getEquipmentList);
exerciseRouter.get('/targetList', getTargetList);

// Sync endpoint for updating database with fresh API data
exerciseRouter.post('/sync', syncExercisesFromApi);

export default exerciseRouter;
