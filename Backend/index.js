import express from 'express';
import './db/index.js';
import { userSchema } from './zod/schemas.js';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.use('/user',userSchema);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});