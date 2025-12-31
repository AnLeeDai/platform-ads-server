import mongoose, { Document } from 'mongoose';

export const AdsSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  videoUrl: { type: String, required: true },
  point: { type: Number, required: true },
  duration: { type: Number, required: true },
});

export type AdsDocument = Document & {
  title: string;
  description: string;
  imageUrl: string;
  videoUrl: string;
  point: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
};
