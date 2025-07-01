import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const planSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Plan name is required'] },
    isPublic: { type: Boolean, required: [true] },
    exercise: [
      {
        exerciseId: {  type: String },
        sets: { type: Number },
        reps: { type: Number },
        weight: { type: Number },
        restTime: { type: Number }
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model('Plan', planSchema);
