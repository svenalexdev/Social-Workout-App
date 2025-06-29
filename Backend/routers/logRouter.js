import { Router } from 'express';
import { logSchema } from '../zod/schemas.js';
import validateBody from '../middlewares/validateBody.js';
import { getLog, createLog, updateLog, getLogById, deleteLog } from '../controllers/logs.js';

const logRouter = Router();

logRouter.route('/').get(getLog).post(validateBody(logSchema), createLog);

logRouter.route('/:id').get(getLogById).put(validateBody(logSchema), updateLog).delete(deleteLog);

export default logRouter;
