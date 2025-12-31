import mongoose, { Document } from 'mongoose';

export type EnumPointType = 'WHEEL' | 'SPEND' | 'ADMIN-ADJUST' | 'ADMIN-BONUS';

export const PointBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: { type: Number, required: true, default: 0 },
});

export const PointHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['WHEEL', 'SPEND', 'ADMIN-ADJUST', 'ADMIN-BONUS'] as EnumPointType[],
  },
});

export type PointBalanceDocument = Document & {
  userId: mongoose.Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PointHistoryDocument = Document & {
  userId: mongoose.Types.ObjectId;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  type: EnumPointType;
  createdAt: Date;
  updatedAt: Date;
};
