import express from 'express';
import './db/index.js';
import exerciseRouter from './routers/exerciseRouter.js';
import userRouter from './routers/userRouter.js';
import planRouter from './routers/planRouter.js';
import logRouter from './routers/logRouter.js';
import authRouter from './routers/authRouter.js';
import errorHandler from './middlewares/errorHandler.js';
import lfgRouter from './routers/lfgRouter.js';
import aiChatRouter from './routers/aiChatRouter.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: process.env.SPA_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/exercises', exerciseRouter);
app.use('/users', userRouter);
app.use('/plans', planRouter);
app.use('/logs', logRouter);
app.use('/auth', authRouter);
app.use('/lfg', lfgRouter);
app.use('/aiplan', aiChatRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
