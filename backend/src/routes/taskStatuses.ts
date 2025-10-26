import express from 'express';
import mongoose from 'mongoose';
import TaskStatus from '../models/TaskStatus';
import { authenticateToken } from '../middleware/auth';
import Joi from 'joi';
import { validate } from '../middleware/validation';

const router = express.Router();

const taskStatusSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(200).allow(''),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#6B7280'),
  order: Joi.number().min(0).required(),
  isCompleted: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true),
  workflowId: Joi.string().optional()
});

const taskStatusUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  description: Joi.string().max(200).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  order: Joi.number().min(0).optional(),
  isCompleted: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  workflowId: Joi.string().optional()
});

// Get all task statuses for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const statuses = await TaskStatus.find({ userId })
      .sort({ order: 1, createdAt: 1 })
      .populate('workflowId', 'name');
    
    res.json({ success: true, data: { statuses } });
  } catch (error) {
    console.error('Error fetching task statuses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get a specific task status
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const status = await TaskStatus.findOne({ _id: req.params.id, userId })
      .populate('workflowId', 'name');
    
    if (!status) {
      return res.status(404).json({ success: false, message: 'Task status not found' });
    }
    
    res.json({ success: true, data: { status } });
  } catch (error) {
    console.error('Error fetching task status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new task status
router.post('/', authenticateToken, validate(taskStatusSchema), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { name, description, color, order, isCompleted, isActive, workflowId } = req.body;

    // Check if status name already exists for this user
    const existingStatus = await TaskStatus.findOne({ userId, name });
    if (existingStatus) {
      return res.status(409).json({ 
        success: false, 
        message: 'Task status with this name already exists' 
      });
    }

    const status = new TaskStatus({
      name,
      description,
      color,
      order,
      isCompleted,
      isActive,
      userId,
      workflowId: workflowId ? new mongoose.Types.ObjectId(workflowId) : undefined
    });

    await status.save();
    await status.populate('workflowId', 'name');
    
    res.status(201).json({ 
      success: true, 
      message: 'Task status created successfully', 
      data: { status } 
    });
  } catch (error) {
    console.error('Error creating task status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update a task status
router.put('/:id', authenticateToken, validate(taskStatusUpdateSchema), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const statusId = req.params.id;
    const { name, description, color, order, isCompleted, isActive, workflowId } = req.body;

    const status = await TaskStatus.findOne({ _id: statusId, userId });
    if (!status) {
      return res.status(404).json({ success: false, message: 'Task status not found' });
    }

    // Check if new name conflicts with existing status
    if (name && name !== status.name) {
      const existingStatus = await TaskStatus.findOne({ userId, name });
      if (existingStatus) {
        return res.status(409).json({ 
          success: false, 
          message: 'Task status with this name already exists' 
        });
      }
    }

    // Update fields
    if (name !== undefined) status.name = name;
    if (description !== undefined) status.description = description;
    if (color !== undefined) status.color = color;
    if (order !== undefined) status.order = order;
    if (isCompleted !== undefined) status.isCompleted = isCompleted;
    if (isActive !== undefined) status.isActive = isActive;
    if (workflowId !== undefined) {
      status.workflowId = workflowId ? new mongoose.Types.ObjectId(workflowId) : undefined;
    }

    await status.save();
    await status.populate('workflowId', 'name');
    
    res.json({ 
      success: true, 
      message: 'Task status updated successfully', 
      data: { status } 
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a task status
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const statusId = req.params.id;

    const status = await TaskStatus.findOne({ _id: statusId, userId });
    if (!status) {
      return res.status(404).json({ success: false, message: 'Task status not found' });
    }

    if (status.isDefault) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete default task statuses' 
      });
    }

    // Check if any tasks are using this status
    const Task = mongoose.model('Task');
    const tasksUsingStatus = await Task.countDocuments({ 
      userId, 
      status: status.name 
    });

    if (tasksUsingStatus > 0) {
      return res.status(409).json({ 
        success: false, 
        message: `Cannot delete status. ${tasksUsingStatus} task(s) are using this status. Please reassign them first.` 
      });
    }

    await status.deleteOne();
    res.json({ success: true, message: 'Task status deleted successfully' });
  } catch (error) {
    console.error('Error deleting task status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Initialize default task statuses
router.post('/initialize-defaults', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    
    // Check if user already has statuses
    const existingStatuses = await TaskStatus.countDocuments({ userId });
    if (existingStatuses > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has task statuses'
      });
    }

    const defaultStatuses = [
      { name: 'To Do', description: 'Tasks that need to be started', color: '#6B7280', order: 1, isCompleted: false, isDefault: true },
      { name: 'In Progress', description: 'Tasks currently being worked on', color: '#F59E0B', order: 2, isCompleted: false, isDefault: true },
      { name: 'Review', description: 'Tasks ready for review', color: '#3B82F6', order: 3, isCompleted: false, isDefault: true },
      { name: 'Completed', description: 'Finished tasks', color: '#10B981', order: 4, isCompleted: true, isDefault: true },
      { name: 'On Hold', description: 'Tasks temporarily paused', color: '#EF4444', order: 5, isCompleted: false, isDefault: true }
    ];

    const createdStatuses = [];
    for (const statusData of defaultStatuses) {
      const status = new TaskStatus({ ...statusData, userId });
      await status.save();
      createdStatuses.push(status);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Default task statuses initialized', 
      data: { statuses: createdStatuses } 
    });
  } catch (error) {
    console.error('Error initializing default task statuses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reorder task statuses
router.put('/reorder', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { statuses } = req.body; // Array of { id, order }

    if (!Array.isArray(statuses)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Statuses must be an array' 
      });
    }

    // Update each status order
    for (const { id, order } of statuses) {
      await TaskStatus.findOneAndUpdate(
        { _id: id, userId },
        { order },
        { new: true }
      );
    }

    res.json({ success: true, message: 'Task statuses reordered successfully' });
  } catch (error) {
    console.error('Error reordering task statuses:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
