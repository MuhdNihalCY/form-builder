import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: string; // Dynamic status - references TaskStatus
  statusId?: mongoose.Types.ObjectId; // Reference to TaskStatus
  level: number; // Dynamic level - references TaskLevel
  levelId?: mongoose.Types.ObjectId; // Reference to TaskLevel
  workflowId?: mongoose.Types.ObjectId; // Reference to Workflow
  dueDate?: Date;
  userId: mongoose.Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 50
  },
  statusId: { 
    type: Schema.Types.ObjectId, 
    ref: 'TaskStatus' 
  },
  level: { 
    type: Number, 
    required: true,
    min: 1,
    max: 10,
    default: 5
  },
  levelId: { 
    type: Schema.Types.ObjectId, 
    ref: 'TaskLevel' 
  },
  workflowId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Workflow' 
  },
  dueDate: { 
    type: Date 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  completedAt: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Update completedAt when status changes to a completed status
taskSchema.pre('save', async function(next) {
  if (this.isModified('status') && !this.completedAt) {
    // Check if the current status is marked as completed
    const TaskStatus = mongoose.model('TaskStatus');
    const statusDoc = await TaskStatus.findOne({ 
      userId: this.userId, 
      name: this.status 
    });
    
    if (statusDoc && statusDoc.isCompleted) {
      this.completedAt = new Date();
    }
  }
  next();
});

// Index for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });

export default mongoose.model<ITask>('Task', taskSchema);
