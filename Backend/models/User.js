import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: [true, 'Firstname is required'] },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'], select: false },
    image: { type: String },
    stats: [
      {
        height: { type: Number, required: false },
        weight: { type: Number, required: false },
        age: { type: Number, required: false }
      }
    ],
    lastLoginDate: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

export default model('User', userSchema);
