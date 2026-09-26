import mongoose, { Schema, Document, Types } from 'mongoose';
import { ISharedUser } from './Folder';

export interface IFile extends Document {
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  folder?: Types.ObjectId | null;
  owner: Types.ObjectId;
  sharedWith: ISharedUser[];
  isPublic: boolean;
  shareToken?: string;
  isStarred: boolean;
  isTrash: boolean;
  deletedAt?: Date | null;
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

const FileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    size: { type: Number, required: true, default: 0 },
    mimeType: { type: String, required: true },
    extension: { type: String, required: true },
    category: {
      type: String,
      enum: ['image', 'video', 'audio', 'document', 'archive', 'other'],
      default: 'other'
    },
    cloudinaryUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    folder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: [SharedUserSchema],
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, unique: true, sparse: true },
    isStarred: { type: Boolean, default: false },
    isTrash: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

FileSchema.index({ owner: 1, folder: 1, isTrash: 1 });
FileSchema.index({ category: 1 });

export const File = mongoose.model<IFile>('File', FileSchema);
