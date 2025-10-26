import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkflow extends Document {
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  statuses: Array<{
    statusId: mongoose.Types.ObjectId;
    order: number;
    isRequired: boolean; // Whether this status is required in the workflow
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const workflowSchema = new Schema<IWorkflow>({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 100 
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500 
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
  },
  statuses: [{
    statusId: { 
      type: Schema.Types.ObjectId, 
      ref: 'TaskStatus', 
      required: true 
    },
    order: { 
      type: Number, 
      required: true,
      min: 0 
    },
    isRequired: { 
      type: Boolean, 
      default: true 
    }
  }]
}, {
  timestamps: true
});

// Ensure workflow names are unique per user
workflowSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model<IWorkflow>('Workflow', workflowSchema);
