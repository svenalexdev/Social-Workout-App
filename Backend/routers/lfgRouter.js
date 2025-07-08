import { Router } from 'express';
import { getGroup, createGroup, getGroupById, updateGroup, deleteGroup, getGroupByUserId } from '../controllers/lfg.js';
import validateBody from '../middlewares/validateBody.js';
import { groupFinderSchema } from '../zod/schemas.js';

const lfgRouter = Router();

lfgRouter.route('/').get(getGroup).post(validateBody(groupFinderSchema), createGroup);

lfgRouter.route('/:id').get(getGroupById).put(validateBody(groupFinderSchema), updateGroup).delete(deleteGroup);

lfgRouter.route('/users/:id').get(getGroupByUserId);

export default lfgRouter;
