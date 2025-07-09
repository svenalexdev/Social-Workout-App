import { Router } from 'express';
import validateZod from '../middlewares/validateBody.js';
import verifyToken from '../middlewares/verifyToken.js';
import { userMessageSchema } from '../zod/schemas.js';
import { createSimpleChat, createChat, createPersonalChat, getChatHistory } from '../controllers/aichats.js';

const aiChatRouter = Router();

aiChatRouter.post('/simple', validateZod(userMessageSchema), createSimpleChat);
aiChatRouter.post('/', validateZod(userMessageSchema), createChat);
aiChatRouter.post('/personal', verifyToken, validateZod(userMessageSchema), createPersonalChat);
aiChatRouter.get('/:id', getChatHistory);

export default aiChatRouter;
