import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

export const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Title cannot be empty',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required'
  }),
  description: Joi.string().max(1000).allow('').messages({
    'string.max': 'Description cannot exceed 1000 characters'
  }),
  category: Joi.string().min(1).max(50).required().messages({
    'string.min': 'Category cannot be empty',
    'string.max': 'Category cannot exceed 50 characters',
    'any.required': 'Category is required'
  }),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('todo', 'in_progress', 'completed').default('todo'),
  dueDate: Joi.date().greater('now').optional().messages({
    'date.greater': 'Due date must be in the future'
  })
});

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }
    
    next();
  };
};
