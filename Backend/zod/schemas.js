import { z } from 'zod/v4';

const userSchema = z.object({
  name: z.string('Name must be string').min(2, 'Name must be at least 2 characters'),
  email: z.email('Must be a valid email'),
  password: z.string().min(8),
  stats: z.array(
    z.object({
      height: z.number().min(1),
      weight: z.number().min(1),
      age: z.number().min(1)
    })
  ),
  lastlogin: z.date().optional()
});

const planSchema = z.object({
  userId: z.string().min(1),
  name: z.string('Name must be string'),
  isPublic: z.boolean(),
  exercise: z.array(
    z.object({
      sets: z.number().min(1),
      reps: z.number().min(1),
      weight: z.number().min(1),
      restTime: z.number().min(1)
    })
  )
});

const logSchema = z.object({
  userId: z.string().min(1),
  planId: z.string().min(1),
  date: z.date().optional(),
  exercise: z.array(
    z.object({
      exerciseId: z.string().min(1),
      name: z.string('Name must be string'),
      bodyParts: z.string('Body part must be string'),
      equipment: z.string('Equipment must be string'),
      weight: z.number().min(1),
      setsCompleted: z.number().min(1),
      reps: z.number().min(1),
      notes: z.string('Notes must be string')
    })
  ),
  duration: z.number().min(1)
});

export { userSchema, planSchema, logSchema };
