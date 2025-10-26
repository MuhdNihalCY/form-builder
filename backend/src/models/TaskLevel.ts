import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskLevel extends Document {
  name: string;
  description?: string;
  level: number; // 1 = highest priority, 2 = medium, etc.
  color: string;
  icon?: string; // Icon identifier for UI
  isDefault: boolean;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskLevelSchema = new Schema<ITaskLevel>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 50 
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 200 
  },
  level: { 
    type: Number, 
    required: true,
    min: 1,
    max: 10 
  },
  color: { 
    type: String, 
    default: '#6B7280',
    match: /^#[0-9A-F]{6}$/i
  },
  icon: { 
    type: String, 
    trim: true,
    maxlength: 50 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

// Ensure level names are unique per user
taskLevelSchema.index({ userId: 1, name: 1 }, { unique: true });
// Index for level ordering
taskLevelSchema.index({ userId: 1, level: 1 });

export default mongoose.model<ITaskLevel>('TaskLevel', taskLevelSchema);
