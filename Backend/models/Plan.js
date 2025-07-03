import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const planSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Plan name is required'] },
    isPublic: { type: Boolean, required: [true] },
    exercise: [
      {
        exerciseId: { type: String },
        sets: { type: Number }, // Total number of sets
        setDetails: [
          {
            setNumber: { type: Number, required: true },
            weight: { type: Number, required: true },
            reps: { type: Number, required: true }
          }
        ],
        restTime: { type: Number },
        exerciseDetails: [
          {
            name: { type: String },
            description: { type: String },
            gifUrl: { type: String },
            target: { type: String },
            equipment: { type: String },
            bodyPart: { type: String },
            secondaryMuscles: [{ type: String }],
            instructions: [{ type: String }]
          }
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model('Plan', planSchema);
