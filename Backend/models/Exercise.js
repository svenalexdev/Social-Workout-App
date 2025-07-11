import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const exerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    gifUrl: { type: String },
    target: { type: String },
    equipment: { type: String },
    bodyPart: { type: String },
    secondaryMuscles: [{ type: String }],
    instructions: [{ type: String }]
  },
  {
    timestamps: true
  }
);

export default model('Exercise', exerciseSchema);
