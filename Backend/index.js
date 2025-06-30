import express from 'express';
import './db/index.js';
// import { userSchema } from './zod/schemas.js';
import exerciseRouter from './routers/exerciseRouter.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// app.use('/user', userSchema);
app.use('/exercises', exerciseRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
