import { Router } from 'express';
import validateBody from '../middlewares/validateBody.js';
import { userSchema } from '../zod/schemas.js';
import fileUploader from '../middlewares/fileUploader.js'
import cloudUploader from '../middlewares/cloudinary.js';
import { getUsers, createUser, getUserById, updateUser, deleteUser,uploadProfileImage } from '../controllers/users.js';

const userRouter = Router();

userRouter.route('/').get(getUsers).post(validateBody(userSchema), createUser);

userRouter.route('/:id').get(getUserById).put(fileUploader.single('image'), cloudUploader,validateBody(userSchema), updateUser).delete(deleteUser);

userRouter.put('/:id/image', fileUploader.single('image'), cloudUploader, uploadProfileImage);

export default userRouter;
