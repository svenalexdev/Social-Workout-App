import { Router } from 'express';
import validateBody from '../middlewares/validateBody.js';
import verifyToken from '../middlewares/verifyToken.js';
import { userSchema, signInSchema } from '../zod/schemas.js';
import { me, signup, signin, signout } from '../controllers/auth.js';

const authRouter = Router();

authRouter.route('/signup').post(validateBody(userSchema), signup);

authRouter.route('/signin').post(validateBody(signInSchema), signin);

authRouter.route('/me').get(verifyToken, me);

authRouter.route('/signout').delete(signout);

export default authRouter;
