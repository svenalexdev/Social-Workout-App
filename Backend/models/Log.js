import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const logSchemas = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    workoutId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true }, // Same as planId but matches localStorage
    workoutSessionId: { type: String, required: true },
    startTime: { type: Date, required: true },
    completedAt: { type: Date, required: true },
    duration: { type: Number }, // Duration in seconds
    currentExerciseIndex: { type: Number, default: 0 },
    completedSets: [
      {
        exerciseId: { type: String, required: true },
        setNumber: { type: Number, required: true },
        weight: { type: Number, required: true },
        reps: { type: Number, required: true },
        completedAt: { type: Date, required: true }
      }
    ],
    setInputs: { type: Schema.Types.Mixed, default: {} }, // Store the setInputs object
    collapsedExercises: { type: Schema.Types.Mixed, default: {} }, // Store the collapsed state
    exercises: [
      {
        exerciseId: { type: String, required: true },
        name: { type: String },
        bodyPart: { type: String },
        equipment: { type: String },
        target: { type: String },
        totalSetsCompleted: { type: Number, default: 0 },
        plannedSets: { type: Number },
        plannedReps: { type: Number },
        plannedWeight: { type: Number }
      }
    ],
    planName: { type: String },
    isPublic: { type: Boolean, default: false },
    notes: { type: String }
  },
  {
    timestamps: true
  }
);

export default model('Log', logSchemas);
