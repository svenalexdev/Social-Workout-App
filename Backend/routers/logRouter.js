import { Router } from 'express';
import { logSchema } from '../zod/schemas.js';
import validateBody from '../middlewares/validateBody.js';
import verifyToken from '../middlewares/verifyToken.js';
import { getLog, createLog, updateLog, getLogById, deleteLog, getLogByUserId } from '../controllers/logs.js';

const logRouter = Router();

logRouter.route('/').get(getLog).post(verifyToken, validateBody(logSchema), createLog);

logRouter
  .route('/:id')
  .get(verifyToken, getLogById)
  .put(verifyToken, validateBody(logSchema), updateLog)
  .delete(verifyToken, deleteLog);

logRouter.route('/users/:id').get(verifyToken, getLogByUserId);

export default logRouter;
