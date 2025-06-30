import mongoose from 'mongoose';
import { Schema, model } from 'mongoose';

const logSchemas = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },
    planId: { type: Schema.Types.ObjectId },
    date: { type: Date, required: [true, 'Date is required'] },
    exercise: [
      {
        exerciseId: { type: Schema.Types.ObjectId },
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
