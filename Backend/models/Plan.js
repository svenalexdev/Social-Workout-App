import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const planSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId },
    name: { type: String, required: [true, 'Plan name is required'] },
    isPublic: { type: Boolean, required: [true] },
    exercise: [
      {
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
