import { Router } from 'express';
import validateBody from '../middlewares/validateBody';
import { userSchema } from '../zod/schemas';
import { getUsers, createUser, getUserById, updateUser, deleteUser } from '../controllers/users';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(validateBody(userSchema), createUser);

userRouter.route('/:id').get(getUserById).put(validateBody(userSchema), updateUser).delete(deleteUser);

export default userRouter;
