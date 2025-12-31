import mongoose, { Document } from 'mongoose';

export type AdminInventoryPrizeType = 'CASH' | 'COUPON' | 'POINT';

export const AdminInventorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['CASH', 'COUPON', 'POINT'] as AdminInventoryPrizeType[],
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  expiresAt: {
    type: Date,
    required: function (this: { type?: AdminInventoryPrizeType }) {
      return this.type === 'COUPON';
    },
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
});

export type AdminInventoryDocument = Document & {
  title: string;
  type: AdminInventoryPrizeType;
  value: number;
  quantity: number;
  expiresAt?: Date;
  probability: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
