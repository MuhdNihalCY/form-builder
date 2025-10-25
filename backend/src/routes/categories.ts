import express from 'express';
import Category from '../models/Category';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import Joi from 'joi';
import mongoose from 'mongoose';

const router = express.Router();

// Validation schemas
const categorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  description: Joi.string().max(200).allow(''),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6')
});

const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(50).optional(),
  description: Joi.string().max(200).allow('').optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional()
});

// Get all categories for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    
    const categories = await Category.find({ userId })
      .sort({ isDefault: -1, taskCount: -1, name: 1 });

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single category
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findOne({ 
      _id: req.params.id, 
      userId: new mongoose.Types.ObjectId(req.user!.userId) 
    });

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new category
router.post('/', authenticateToken, validate(categorySchema), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    
    // Check if category name already exists for this user
    const existingCategory = await Category.findOne({ 
      userId, 
      name: req.body.name 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new Category({
      ...req.body,
      userId
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update category
router.put('/:id', authenticateToken, validate(categoryUpdateSchema), async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    
    // Check if new name conflicts with existing category
    if (req.body.name) {
      const existingCategory = await Category.findOne({ 
        userId, 
        name: req.body.name,
        _id: { $ne: req.params.id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    
    const category = await Category.findOne({ 
      _id: req.params.id, 
      userId 
    });

    if (!category) {
      return res.status(404).json({ 
        success: false,
        message: 'Category not found' 
      });
    }

    // Check if category is default
    if (category.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default category'
      });
    }

    // Check if category has tasks
    if (category.taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing tasks'
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Initialize default categories for a user
router.post('/initialize-defaults', authenticateToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    
    // Check if user already has categories
    const existingCategories = await Category.countDocuments({ userId });
    
    if (existingCategories > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already has categories'
      });
    }

    const defaultCategories = [
      { name: 'Work', description: 'Work-related tasks', color: '#3B82F6', isDefault: true },
      { name: 'Personal', description: 'Personal tasks', color: '#10B981', isDefault: true },
      { name: 'Health', description: 'Health and fitness tasks', color: '#F59E0B', isDefault: true },
      { name: 'Learning', description: 'Learning and education tasks', color: '#8B5CF6', isDefault: true },
      { name: 'Shopping', description: 'Shopping and errands', color: '#EF4444', isDefault: true }
    ];

    const categories = await Category.insertMany(
      defaultCategories.map(cat => ({ ...cat, userId }))
    );

    res.status(201).json({
      success: true,
      message: 'Default categories created successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Initialize default categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
