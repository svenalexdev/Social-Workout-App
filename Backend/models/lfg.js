import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const groupFinderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: [true, 'Activity name  is required'] },
    description: { type: String },
    gym: { type: String },
    time: { type: String },
    showWorkoutPlan: { type: Boolean },
    workoutPlanId: { type: String },
    attendeessLimit: { type: Number },
    attendess: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true},
        status: { type: String }
      }
    ],
    bodyParts: [
      {
        abductors: { type: String },
        abs: { type: String },
        adductors: { type: String },
        biceps: { type: String },
        calves: { type: String },
        cardiovascularSystem: { type: String },
        deltes: { type: String },
        forearms: { type: String },
        glutes: { type: String },
        hamStrings: { type: String },
        lats: { type: String },
        levatorScapule: { type: String },
        pectorals: { type: String },
        quads: { type: String },
        serratusAnterior: { type: String },
        spin: { type: String },
        traps: { type: String },
        triceps: { type: String },
        upperBack: { type: String }
      }
    ]
  },
  {
    timestamps: true
  }
);

export default model('Lfg', groupFinderSchema);
