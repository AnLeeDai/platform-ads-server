import mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',
        required: true,
      },
      name: { type: String, required: true },
    },
  ],
  avatarUrl: { type: String },
});

export type UserDocument = mongoose.Document & {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  roles: Array<{ _id: mongoose.Types.ObjectId; name: string }>;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};
