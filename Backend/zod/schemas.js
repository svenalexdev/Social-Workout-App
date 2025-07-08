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

const groupFinderSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  gym: z.string().min(1),
  time: z.string(),
  showWorkoutPlan: z.boolean(),
  workoutPlanId: z.string().min(1),
  attendeessLimit: z.number().min(1),
  attendess: z.array(
    z.object({
      userId: z.string().min(1),
      status: z.string().min(1)
    })
  ),
  bodyParts: z.array(
    z.object({
      abductors: z.string().optional(),
      abs: z.string().optional(),
      adductors: z.string().optional(),
      biceps: z.string().optional(),
      calves: z.string().optional(),
      cardiovascularSystem: z.string().optional(),
      deltes: z.string().optional(),
      forearms: z.string().optional(),
      glutes: z.string().optional(),
      hamStrings: z.string().optional(),
      lats: z.string().optional(),
      levatorScapule: z.string().optional(),
      pectorals: z.string().optional(),
      quads: z.string().optional(),
      serratusAnterior: z.string().optional(),
      spin: z.string().optional(),
      traps: z.string().optional(),
      triceps: z.string().optional(),
      upperBack: z.string().optional()
    })
  )
});

const signInSchema = userSchema.omit({ name: true, stats: true });

export { userSchema, planSchema, logSchema, signInSchema,groupFinderSchema };
