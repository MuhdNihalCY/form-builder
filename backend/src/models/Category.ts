import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  color: string;
  userId: mongoose.Types.ObjectId;
  isDefault: boolean;
  taskCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
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
    required: true,
    default: '#3B82F6' // Default blue color
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  taskCount: { 
    type: Number, 
    default: 0 
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ userId: 1, isDefault: 1 });

// Update task count when tasks are created/updated/deleted
categorySchema.methods.updateTaskCount = async function() {
  const Task = mongoose.model('Task');
  const count = await Task.countDocuments({ 
    userId: this.userId, 
    category: this.name 
  });
  this.taskCount = count;
  await this.save();
};

export default mongoose.model<ICategory>('Category', categorySchema);
