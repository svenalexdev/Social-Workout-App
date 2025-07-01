import express from 'express';
import './db/index.js';
import exerciseRouter from './routers/exerciseRouter.js';
import userRouter from './routers/userRouter.js';
import planRouter from './routers/planRouter.js';
import logRouter from './routers/logRouter.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: process.env.SPA_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/exercises', exerciseRouter);
app.use('/users', userRouter);
app.use('/plans', planRouter);
app.use('/logs', logRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
