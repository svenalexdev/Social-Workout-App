import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const logSchemas = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
    date: { type: Date },
    exercise: [
      {
        exerciseId: { type: String },
        name: { type: String, required: [true, 'Exercise name is required Ex:Deadlift'] },
        bodyParts: { type: String, required: [true, 'Bodypart is requires'] },
        equipment: { type: String },
        weight: { type: Number },
        setsCompleted: { type: Number },
        reps: { type: Number },
        notes: { type: String }
      }
    ],
    duration: { type: Number }
  },
  {
    timestamps: true
  }
);
export default model('Log', logSchemas);
