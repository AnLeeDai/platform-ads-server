import mongoose, { Document } from 'mongoose';

export const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['admin', 'user'] },
});

export type RoleDocument = Document & {
  _id: mongoose.Types.ObjectId;
  name: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
};
