import { Router } from 'express';
import validateBody from '../middlewares/validateBody.js';
import { userSchema } from '../zod/schemas.js';
import { getUsers, createUser, getUserById, updateUser, deleteUser } from '../controllers/users.js';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(validateBody(userSchema), createUser);

userRouter.route('/:id').get(getUserById).put(validateBody(userSchema), updateUser).delete(deleteUser);

export default userRouter;
