import mongoose, { Document } from 'mongoose';

export const UserInventoryItemSchema = new mongoose.Schema({
  prizeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminInventory',
    required: true,
  },
  quantity: { type: Number, required: true, default: 1, min: 0 },
  expiresAt: { type: Date, required: false },
});

export const UserInventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: {
    type: [UserInventoryItemSchema],
    required: true,
    default: [],
  },
});

export type UserInventoryDocument = Document & {
  userId: mongoose.Types.ObjectId;
  items: Array<{
    prizeId: mongoose.Types.ObjectId;
    quantity: number;
    expiresAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
};
