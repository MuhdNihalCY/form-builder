import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskStatus extends Document {
  name: string;
  description?: string;
  color: string;
  order: number; // For ordering statuses in workflow
  isDefault: boolean;
  isCompleted: boolean; // Whether this status represents completion
  isActive: boolean; // Whether this status is currently active
  userId: mongoose.Types.ObjectId;
  workflowId?: mongoose.Types.ObjectId; // Optional workflow grouping
  createdAt: Date;
  updatedAt: Date;
}

const taskStatusSchema = new Schema<ITaskStatus>({
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
  color: { 
    type: String, 
    default: '#6B7280',
    match: /^#[0-9A-F]{6}$/i
  },
  order: { 
    type: Number, 
    required: true,
    min: 0 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  isCompleted: { 
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
  },
  workflowId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Workflow' 
  }
}, {
  timestamps: true
});

// Ensure status names are unique per user
taskStatusSchema.index({ userId: 1, name: 1 }, { unique: true });
// Index for workflow ordering
taskStatusSchema.index({ userId: 1, order: 1 });

export default mongoose.model<ITaskStatus>('TaskStatus', taskStatusSchema);
