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
      exerciseId: z.string().min(1),
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
  workoutId: z.string().min(1),
  workoutSessionId: z.string().min(1),
  startTime: z.string().datetime(),
  completedAt: z.string().datetime(),
  duration: z.number().min(0).optional(),
  currentExerciseIndex: z.number().min(0).default(0),
  completedSets: z.array(
    z.object({
      exerciseId: z.string().min(1),
      setNumber: z.number().min(1),
      weight: z.number().min(0),
      reps: z.number().min(1),
      completedAt: z.string().datetime()
    })
  ),
  setInputs: z.any().default({}), // Allow any object structure
  collapsedExercises: z.any().default({}), // Allow any object structure with numeric-like keys
  exercises: z.array(
    z.object({
      exerciseId: z.string().min(1),
      name: z.string().optional(),
      bodyPart: z.string().optional(),
      equipment: z.string().optional(),
      target: z.string().optional(),
      totalSetsCompleted: z.number().min(0).default(0),
      plannedSets: z.number().min(1).optional(),
      plannedReps: z.number().min(1).optional(),
      plannedWeight: z.number().min(0).optional()
    })
  ),
  planName: z.string().optional(),
  isPublic: z.boolean().default(false),
  notes: z.string().optional()
});

const signInSchema = userSchema.omit({ name: true, stats: true });

export { userSchema, planSchema, logSchema, signInSchema };
