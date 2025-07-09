import { Router } from 'express';
import { getGroup, createGroup, getGroupById, updateGroup, deleteGroup, getGroupByUserId, joinGroup, leaveGroup, updateAttendeeStatus } from '../controllers/lfg.js';
import validateBody from '../middlewares/validateBody.js';
import verifyToken from '../middlewares/verifyToken.js';
import { groupFinderSchema } from '../zod/schemas.js';

const lfgRouter = Router();

lfgRouter.route('/').get(getGroup).post(verifyToken, validateBody(groupFinderSchema), createGroup);

lfgRouter
  .route('/:id')
  .get(getGroupById)
  .put(verifyToken, validateBody(groupFinderSchema), updateGroup)
  .delete(verifyToken, deleteGroup);

// Join and leave routes
lfgRouter.route('/:id/join').post(verifyToken, joinGroup);
lfgRouter.route('/:id/leave').delete(verifyToken, leaveGroup);

// Attendee management route (for activity owners)
lfgRouter.route('/:id/attendee/:attendeeId').put(verifyToken, updateAttendeeStatus);

lfgRouter.route('/users/:id').get(getGroupByUserId);

export default lfgRouter;
