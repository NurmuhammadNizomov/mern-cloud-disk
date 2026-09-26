import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISharedUser {
  user?: Types.ObjectId;
  email: string;
  role: 'viewer' | 'editor';
}

export interface IFolder extends Document {
  name: string;
  parentFolder?: Types.ObjectId | null;
  owner: Types.ObjectId;
  sharedWith: ISharedUser[];
  isStarred: boolean;
  isTrash: boolean;
  deletedAt?: Date | null;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SharedUserSchema = new Schema<ISharedUser>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' }
  },
  { _id: false }
);

const FolderSchema = new Schema<IFolder>(
  {
    name: { type: String, required: true, trim: true },
    parentFolder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [SharedUserSchema],
    isStarred: { type: Boolean, default: false },
    isTrash: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    color: { type: String, default: '#4285F4' }
  },
  { timestamps: true }
);

FolderSchema.index({ owner: 1, parentFolder: 1, isTrash: 1 });

export const Folder = mongoose.model<IFolder>('Folder', FolderSchema);
