import express from 'express';
import mongoose from 'mongoose';
import TaskLevel from '../models/TaskLevel';
import { authenticateToken } from '../middleware/auth';
import Joi from 'joi';
import { validate } from '../middleware/validation';

const router = express.Router();

const taskLevelSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(200).allow(''),
  level: Joi.number().min(1).max(10).required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#6B7280'),
  icon: Joi.string().max(50).allow(''),
  isActive: Joi.boolean().default(true)
});

const taskLevelUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  description: Joi.string().max(200).allow('').optional(),
  level: Joi.number().min(1).max(10).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  icon: Joi.string().max(50).allow('').optional(),
  isActive: Joi.boolean().optional()
});

// Get all task levels for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const levels = await TaskLevel.find({ userId })
      .sort({ level: 1, createdAt: 1 });
    
    res.json({ success: true, data: { levels } });
  } catch (error) {
    console.error('Error fetching task levels:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get a specific task level
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const level = await TaskLevel.findOne({ _id: req.params.id, userId });
    
    if (!level) {
      return res.status(404).json({ success: false, message: 'Task level not found' });
    }
    
    res.json({ success: true, data: { level } });
  } catch (error) {
    console.error('Error fetching task level:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new task level
router.post('/', authenticateToken, validate(taskLevelSchema), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { name, description, level, color, icon, isActive } = req.body;

    // Check if level name already exists for this user
    const existingLevel = await TaskLevel.findOne({ userId, name });
    if (existingLevel) {
      return res.status(409).json({ 
        success: false, 
        message: 'Task level with this name already exists' 
      });
    }

    // Check if level number already exists for this user
    const existingLevelNumber = await TaskLevel.findOne({ userId, level });
    if (existingLevelNumber) {
      return res.status(409).json({ 
        success: false, 
        message: 'Task level with this number already exists' 
      });
    }

    const taskLevel = new TaskLevel({
      name,
      description,
      level,
      color,
      icon,
      isActive,
      userId
    });

    await taskLevel.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Task level created successfully', 
      data: { level: taskLevel } 
    });
  } catch (error) {
    console.error('Error creating task level:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update a task level
router.put('/:id', authenticateToken, validate(taskLevelUpdateSchema), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const levelId = req.params.id;
    const { name, description, level, color, icon, isActive } = req.body;

    const taskLevel = await TaskLevel.findOne({ _id: levelId, userId });
    if (!taskLevel) {
      return res.status(404).json({ success: false, message: 'Task level not found' });
    }

    // Check if new name conflicts with existing level
    if (name && name !== taskLevel.name) {
      const existingLevel = await TaskLevel.findOne({ userId, name });
      if (existingLevel) {
        return res.status(409).json({ 
          success: false, 
          message: 'Task level with this name already exists' 
        });
      }
    }

    // Check if new level number conflicts with existing level
    if (level && level !== taskLevel.level) {
      const existingLevelNumber = await TaskLevel.findOne({ userId, level });
      if (existingLevelNumber) {
        return res.status(409).json({ 
          success: false, 
          message: 'Task level with this number already exists' 
        });
      }
    }

    // Update fields
    if (name !== undefined) taskLevel.name = name;
    if (description !== undefined) taskLevel.description = description;
    if (level !== undefined) taskLevel.level = level;
    if (color !== undefined) taskLevel.color = color;
    if (icon !== undefined) taskLevel.icon = icon;
    if (isActive !== undefined) taskLevel.isActive = isActive;

    await taskLevel.save();
    
    res.json({ 
      success: true, 
      message: 'Task level updated successfully', 
      data: { level: taskLevel } 
    });
  } catch (error) {
    console.error('Error updating task level:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete a task level
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const levelId = req.params.id;

    const taskLevel = await TaskLevel.findOne({ _id: levelId, userId });
    if (!taskLevel) {
      return res.status(404).json({ success: false, message: 'Task level not found' });
    }

    if (taskLevel.isDefault) {
      return res.status(403).json({ 
        success: false, 
        message: 'Cannot delete default task levels' 
      });
    }

    // Check if any tasks are using this level
    const Task = mongoose.model('Task');
    const tasksUsingLevel = await Task.countDocuments({ 
      userId, 
      level: taskLevel.level 
    });

    if (tasksUsingLevel > 0) {
      return res.status(409).json({ 
        success: false, 
        message: `Cannot delete level. ${tasksUsingLevel} task(s) are using this level. Please reassign them first.` 
      });
    }

    await taskLevel.deleteOne();
    res.json({ success: true, message: 'Task level deleted successfully' });
  } catch (error) {
    console.error('Error deleting task level:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Initialize default task levels
router.post('/initialize-defaults', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    
    // Check if user already has levels
    const existingLevels = await TaskLevel.countDocuments({ userId });
    if (existingLevels > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has task levels'
      });
    }

    const defaultLevels = [
      { name: 'Critical', description: 'Highest priority tasks', level: 1, color: '#DC2626', icon: '🔥', isDefault: true },
      { name: 'High', description: 'Important tasks', level: 2, color: '#EA580C', icon: '⚡', isDefault: true },
      { name: 'Medium', description: 'Normal priority tasks', level: 3, color: '#D97706', icon: '📋', isDefault: true },
      { name: 'Low', description: 'Lower priority tasks', level: 4, color: '#059669', icon: '📝', isDefault: true },
      { name: 'Backlog', description: 'Future tasks', level: 5, color: '#6B7280', icon: '📚', isDefault: true }
    ];

    const createdLevels = [];
    for (const levelData of defaultLevels) {
      const level = new TaskLevel({ ...levelData, userId });
      await level.save();
      createdLevels.push(level);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Default task levels initialized', 
      data: { levels: createdLevels } 
    });
  } catch (error) {
    console.error('Error initializing default task levels:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
