import { Router } from 'express';
import validateBody from '../middlewares/validateBody.js';
import { planSchema } from '../zod/schemas.js';
import { getPlan, createPlan, getPlanById, updatePlan, deletePlan } from '../controllers/plans.js';

const planRouter = Router();

planRouter.route('/').get(getPlan).post(validateBody(planSchema), createPlan);

planRouter.route('/:id').get(getPlanById).put(validateBody(planSchema), updatePlan).delete(deletePlan);

export default planRouter;
