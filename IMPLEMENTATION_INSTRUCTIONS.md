# Task Manager Dashboard - Implementation Instructions

## Overview
This document provides comprehensive step-by-step instructions for building the Task Manager Dashboard application based on the Software Requirements Specification (SRS).

## Technology Stack

### Frontend
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Redux Toolkit or Zustand
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router v6
- **Forms**: React Hook Form with validation
- **Authentication**: JWT tokens with axios interceptors

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcrypt for password hashing
- **Validation**: Joi or express-validator
- **CORS**: cors middleware
- **Environment**: dotenv for configuration

### Development Tools
- **Package Manager**: npm or yarn
- **Build Tool**: Vite (for React) or Webpack
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Version Control**: Git
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

## Project Structure

```
task_manager/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   ├── services/        # API calls
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── assets/          # Images, icons, etc.
│   ├── public/
│   └── package.json
├── backend/                  # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── tests/
│   └── package.json
└── README.md
```

## Implementation Steps

### Phase 1: Project Setup (Week 1 - Days 1-2)

#### 1.1 Initialize Project Structure
```bash
# Create main project directory
mkdir task_manager
cd task_manager

# Initialize Git repository
git init
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo "build/" >> .gitignore

# Create frontend and backend directories
mkdir frontend backend
```

#### 1.2 Backend Setup
```bash
cd backend
npm init -y

# Install dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken joi helmet morgan
npm install -D @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken typescript ts-node nodemon

# Create TypeScript configuration
npx tsc --init
```

**Backend package.json scripts:**
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest"
  }
}
```

#### 1.3 Frontend Setup
```bash
cd ../frontend
npx create-react-app . --template typescript
# OR use Vite for faster development
# npm create vite@latest . -- --template react-ts

# Install additional dependencies
npm install axios react-router-dom @reduxjs/toolkit react-redux
npm install chart.js react-chartjs-2 react-hook-form @hookform/resolvers yup
npm install tailwindcss @headlessui/react @heroicons/react
npm install -D @types/react-router-dom
```

### Phase 2: Backend Development (Week 1 - Days 3-7)

#### 2.1 Database Models
Create `backend/src/models/` directory and implement:

**User Model** (`backend/src/models/User.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'individual' | 'team_member' | 'team_admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['individual', 'team_member', 'team_admin'], default: 'individual' }
}, {
  timestamps: true
});

export default mongoose.model<IUser>('User', userSchema);
```

**Task Model** (`backend/src/models/Task.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: Date;
  userId: mongoose.Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
  dueDate: Date,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  completedAt: Date
}, {
  timestamps: true
});

export default mongoose.model<ITask>('Task', taskSchema);
```

#### 2.2 Authentication Middleware
Create `backend/src/middleware/auth.ts`:
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};
```

#### 2.3 API Routes
Create `backend/src/routes/` directory:

**Auth Routes** (`backend/src/routes/auth.ts`):
```typescript
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

**Task Routes** (`backend/src/routes/tasks.ts`):
```typescript
import express from 'express';
import Task from '../models/Task';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all tasks for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new task
router.post('/', authenticateToken, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      userId: req.user.userId
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

#### 2.4 Main Server File
Create `backend/src/index.ts`:
```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Phase 3: Frontend Development (Week 2)

#### 3.1 Project Structure Setup
Create the following directories in `frontend/src/`:
```bash
mkdir -p src/components src/pages src/hooks src/store src/services src/utils src/types
```

#### 3.2 State Management Setup
Create `frontend/src/store/index.ts`:
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import taskSlice from './slices/taskSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tasks: taskSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### 3.3 Authentication Slice
Create `frontend/src/store/slices/authSlice.ts`:
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    localStorage.setItem('token', response.token);
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; name: string }) => {
    const response = await authService.register(userData);
    localStorage.setItem('token', response.token);
    return response;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
```

#### 3.4 API Service Layer
Create `frontend/src/services/api.ts`:
```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 3.5 Core Components
Create `frontend/src/components/TaskCard.tsx`:
```typescript
import React from 'react';
import { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          <p>Category: {task.category}</p>
          {task.dueDate && (
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Edit
          </button>
          
          <button
            onClick={() => onDelete(task._id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Phase 4: Dashboard Implementation (Week 3)

#### 4.1 Dashboard Component
Create `frontend/src/pages/Dashboard.tsx`:
```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchTasks } from '../store/slices/taskSlice';
import { TaskStats } from '../components/TaskStats';
import { ProductivityChart } from '../components/ProductivityChart';
import { RecentTasks } from '../components/RecentTasks';

export const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state: RootState) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <TaskStats tasks={tasks} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityChart tasks={tasks} />
        <RecentTasks tasks={tasks} />
      </div>
    </div>
  );
};
```

#### 4.2 Charts Implementation
Create `frontend/src/components/ProductivityChart.tsx`:
```typescript
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Task } from '../types/task';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProductivityChartProps {
  tasks: Task[];
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ tasks }) => {
  // Calculate productivity data for the last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();
  
  const completedTasksByDay = last7Days.map(day => {
    return tasks.filter(task => 
      task.status === 'completed' && 
      task.completedAt && 
      task.completedAt.split('T')[0] === day
    ).length;
  });

  const data = {
    labels: last7Days.map(day => new Date(day).toLocaleDateString()),
    datasets: [
      {
        label: 'Completed Tasks',
        data: completedTasksByDay,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Productivity Trends (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Bar data={data} options={options} />
    </div>
  );
};
```

### Phase 5: Testing and Deployment (Week 4)

#### 5.1 Testing Setup
Create `backend/tests/task.test.ts`:
```typescript
import request from 'supertest';
import app from '../src/index';
import mongoose from 'mongoose';

describe('Task API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI!);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        category: 'Work',
        priority: 'high',
        dueDate: new Date(),
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.title).toBe(taskData.title);
    });
  });
});
```

#### 5.2 Environment Configuration
Create `backend/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task_manager
MONGODB_TEST_URI=mongodb://localhost:27017/task_manager_test
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

Create `frontend/.env.example`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### 5.3 Deployment Configuration

**Vercel Configuration** (`frontend/vercel.json`):
```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Railway Configuration** (`backend/railway.json`):
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health"
  }
}
```

## Development Workflow

### Daily Development Process
1. **Morning Setup**: Pull latest changes, start development servers
2. **Feature Development**: Implement features following TDD approach
3. **Testing**: Write and run tests for new features
4. **Code Review**: Self-review code before committing
5. **Documentation**: Update documentation for new features

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/task-crud
git add .
git commit -m "feat: implement task CRUD operations"
git push origin feature/task-crud
# Create pull request for review
```

### Code Quality Standards
- **ESLint**: Enforce consistent code style
- **Prettier**: Auto-format code
- **TypeScript**: Strict type checking
- **Testing**: Minimum 80% code coverage
- **Documentation**: JSDoc comments for all functions

## Performance Optimization

### Frontend Optimizations
- **Code Splitting**: Lazy load components
- **Memoization**: Use React.memo for expensive components
- **Virtual Scrolling**: For large task lists
- **Image Optimization**: Compress and lazy load images

### Backend Optimizations
- **Database Indexing**: Index frequently queried fields
- **Caching**: Redis for session and frequently accessed data
- **Pagination**: Limit query results
- **Compression**: Gzip compression for API responses

## Security Considerations

### Authentication & Authorization
- **JWT Expiration**: Short-lived tokens with refresh mechanism
- **Password Requirements**: Minimum complexity requirements
- **Rate Limiting**: Prevent brute force attacks
- **CORS Configuration**: Restrict allowed origins

### Data Protection
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Escape user-generated content
- **HTTPS**: Enforce secure connections

## Monitoring and Analytics

### Error Tracking
- **Sentry**: Real-time error monitoring
- **Logging**: Structured logging with Winston
- **Health Checks**: API endpoint monitoring

### Performance Monitoring
- **Google Analytics**: User behavior tracking
- **Web Vitals**: Core web vitals monitoring
- **API Response Times**: Backend performance tracking

## Maintenance and Updates

### Regular Maintenance Tasks
- **Dependency Updates**: Monthly security updates
- **Database Maintenance**: Regular backups and optimization
- **Performance Reviews**: Quarterly performance audits
- **Security Audits**: Monthly security assessments

### Feature Roadmap
- **Phase 2**: Team collaboration features
- **Phase 3**: Advanced reporting and analytics
- **Phase 4**: Mobile app development
- **Phase 5**: Third-party integrations

## Troubleshooting Guide

### Common Issues
1. **Database Connection**: Check MongoDB URI and network connectivity
2. **Authentication Errors**: Verify JWT secret and token expiration
3. **CORS Issues**: Check allowed origins in backend configuration
4. **Build Failures**: Clear node_modules and reinstall dependencies

### Debug Commands
```bash
# Backend debugging
npm run dev -- --inspect
# Frontend debugging
npm start -- --inspect
# Database connection test
mongosh "mongodb://localhost:27017/task_manager"
```

## Advanced Features Implementation

### Phase 6: Advanced Features (Week 5-6)

#### 6.1 Real-time Notifications
**Backend Implementation** (`backend/src/models/Notification.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'task_due' | 'task_completed' | 'team_invite' | 'system';
  isRead: boolean;
  data?: any;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['task_due', 'task_completed', 'team_invite', 'system'], required: true },
  isRead: { type: Boolean, default: false },
  data: Schema.Types.Mixed
}, {
  timestamps: true
});

export default mongoose.model<INotification>('Notification', notificationSchema);
```

**WebSocket Integration** (`backend/src/services/notificationService.ts`):
```typescript
import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification';

class NotificationService {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketAuth();
  }

  private setupSocketAuth() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });
  }

  async sendNotification(userId: string, notification: {
    title: string;
    message: string;
    type: string;
    data?: any;
  }) {
    // Save to database
    const newNotification = new Notification({
      userId,
      ...notification
    });
    await newNotification.save();

    // Send via WebSocket
    this.io.to(`user_${userId}`).emit('notification', newNotification);
  }

  async sendTaskDueReminder(task: any) {
    const notification = {
      title: 'Task Due Soon',
      message: `Task "${task.title}" is due ${task.dueDate}`,
      type: 'task_due',
      data: { taskId: task._id }
    };
    
    await this.sendNotification(task.userId.toString(), notification);
  }
}

export default NotificationService;
```

**Frontend Notification Component** (`frontend/src/components/NotificationCenter.tsx`):
```typescript
import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Connect to WebSocket for real-time notifications
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5001', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification._id)}
                >
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

#### 6.2 Task Templates
**Backend Template Model** (`backend/src/models/TaskTemplate.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ITaskTemplate extends Document {
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number; // in minutes
  tags: string[];
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskTemplateSchema = new Schema<ITaskTemplate>({
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  estimatedDuration: { type: Number, default: 60 },
  tags: [String],
  isPublic: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  usageCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

export default mongoose.model<ITaskTemplate>('TaskTemplate', taskTemplateSchema);
```

**Template Routes** (`backend/src/routes/templates.ts`):
```typescript
import express from 'express';
import TaskTemplate from '../models/TaskTemplate';
import Task from '../models/Task';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all templates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await TaskTemplate.find({
      $or: [
        { isPublic: true },
        { createdBy: req.user.userId }
      ]
    }).sort({ usageCount: -1 });
    
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create template from task
router.post('/from-task/:taskId', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      userId: req.user.userId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const template = new TaskTemplate({
      name: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      createdBy: req.user.userId
    });

    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task from template
router.post('/:templateId/create-task', authenticateToken, async (req, res) => {
  try {
    const template = await TaskTemplate.findById(req.params.templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const task = new Task({
      title: template.name,
      description: template.description,
      category: template.category,
      priority: template.priority,
      userId: req.user.userId
    });

    await task.save();
    
    // Increment usage count
    template.usageCount += 1;
    await template.save();

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
```

#### 6.3 Time Tracking
**Time Tracking Model** (`backend/src/models/TimeEntry.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeEntry extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timeEntrySchema = new Schema<ITimeEntry>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  duration: Number,
  description: String,
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema);
```

**Time Tracking Component** (`frontend/src/components/TimeTracker.tsx`):
```typescript
import React, { useState, useEffect } from 'react';
import { PlayIcon, StopIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TimeTrackerProps {
  taskId: string;
  onTimeUpdate: (duration: number) => void;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({ taskId, onTimeUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const startTimer = async () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    
    // Create time entry in backend
    await fetch('/api/time-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        taskId,
        startTime: now.toISOString()
      })
    });
  };

  const stopTimer = async () => {
    setIsRunning(false);
    const now = new Date();
    
    // Update time entry in backend
    await fetch('/api/time-entries/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        taskId,
        endTime: now.toISOString()
      })
    });

    onTimeUpdate(elapsedTime);
    setElapsedTime(0);
    setStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <ClockIcon className="h-5 w-5 text-gray-500" />
      
      <div className="text-lg font-mono">
        {formatTime(elapsedTime)}
      </div>
      
      {!isRunning ? (
        <button
          onClick={startTimer}
          className="flex items-center space-x-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <PlayIcon className="h-4 w-4" />
          <span>Start</span>
        </button>
      ) : (
        <button
          onClick={stopTimer}
          className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <StopIcon className="h-4 w-4" />
          <span>Stop</span>
        </button>
      )}
    </div>
  );
};
```

#### 6.4 Team Collaboration
**Team Model** (`backend/src/models/Team.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description: string;
  admin: mongoose.Types.ObjectId;
  members: Array<{
    userId: mongoose.Types.ObjectId;
    role: 'member' | 'admin';
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  description: String,
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model<ITeam>('Team', teamSchema);
```

**Shared Task Model** (`backend/src/models/SharedTask.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedTask extends Document {
  taskId: mongoose.Types.ObjectId;
  teamId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
}

const sharedTaskSchema = new Schema<ISharedTask>({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, {
  timestamps: true
});

export default mongoose.model<ISharedTask>('SharedTask', sharedTaskSchema);
```

#### 6.5 Advanced Analytics Dashboard
**Analytics Service** (`backend/src/services/analyticsService.ts`):
```typescript
import Task from '../models/Task';
import TimeEntry from '../models/TimeEntry';
import { ObjectId } from 'mongoose';

export class AnalyticsService {
  static async getProductivityMetrics(userId: string, period: 'week' | 'month' | 'year') {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const tasks = await Task.find({
      userId: new ObjectId(userId),
      createdAt: { $gte: startDate }
    });

    const timeEntries = await TimeEntry.find({
      userId: new ObjectId(userId),
      startTime: { $gte: startDate }
    });

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    const totalTimeSpent = timeEntries.reduce((sum, entry) => {
      return sum + (entry.duration || 0);
    }, 0);

    const averageTaskTime = completedTasks > 0 ? totalTimeSpent / completedTasks : 0;

    // Category breakdown
    const categoryBreakdown = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityDistribution = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTasks,
      completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      totalTimeSpent: Math.round(totalTimeSpent),
      averageTaskTime: Math.round(averageTaskTime),
      categoryBreakdown,
      priorityDistribution
    };
  }

  static async getTimeDistribution(userId: string, period: 'week' | 'month') {
    const now = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const timeEntries = await TimeEntry.find({
      userId: new ObjectId(userId),
      startTime: { $gte: startDate }
    }).populate('taskId');

    // Group by day/hour
    const timeDistribution = timeEntries.reduce((acc, entry) => {
      const date = new Date(entry.startTime);
      const key = period === 'week' 
        ? date.toISOString().split('T')[0]
        : `${date.getHours()}:00`;
      
      acc[key] = (acc[key] || 0) + (entry.duration || 0);
      return acc;
    }, {} as Record<string, number>);

    return timeDistribution;
  }
}
```

**Advanced Analytics Component** (`frontend/src/components/AdvancedAnalytics.tsx`):
```typescript
import React, { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useAppSelector } from '../hooks/redux';

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTimeSpent: number;
  averageTaskTime: number;
  categoryBreakdown: Record<string, number>;
  priorityDistribution: Record<string, number>;
}

export const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeDistribution, setTimeDistribution] = useState<Record<string, number>>({});
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/metrics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAnalytics(data);

      const timeResponse = await fetch(`/api/analytics/time-distribution?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const timeData = await timeResponse.json();
      setTimeDistribution(timeData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  if (!analytics) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  const categoryData = {
    labels: Object.keys(analytics.categoryBreakdown),
    datasets: [{
      data: Object.values(analytics.categoryBreakdown),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40'
      ]
    }]
  };

  const priorityData = {
    labels: Object.keys(analytics.priorityDistribution),
    datasets: [{
      data: Object.values(analytics.priorityDistribution),
      backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
    }]
  };

  const timeData = {
    labels: Object.keys(timeDistribution),
    datasets: [{
      label: 'Time Spent (minutes)',
      data: Object.values(timeDistribution),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
          <p className="text-2xl font-bold text-gray-900">{analytics.totalTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.completionRate}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Time</h3>
          <p className="text-2xl font-bold text-blue-600">{Math.round(analytics.totalTimeSpent / 60)}h</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Avg Task Time</h3>
          <p className="text-2xl font-bold text-purple-600">{Math.round(analytics.averageTaskTime)}m</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Tasks by Category</h3>
          <Doughnut data={categoryData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <Bar data={priorityData} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Time Distribution</h3>
        <Line data={timeData} />
      </div>
    </div>
  );
};
```

#### 6.6 Smart Task Suggestions
**AI-Powered Suggestions** (`backend/src/services/suggestionService.ts`):
```typescript
import Task from '../models/Task';
import TimeEntry from '../models/TimeEntry';
import { ObjectId } from 'mongoose';

export class SuggestionService {
  static async getTaskSuggestions(userId: string) {
    const userTasks = await Task.find({ userId: new ObjectId(userId) });
    const timeEntries = await TimeEntry.find({ userId: new ObjectId(userId) });

    // Analyze patterns
    const suggestions = [];

    // Suggest optimal work times based on completion patterns
    const completionTimes = timeEntries.map(entry => ({
      hour: new Date(entry.startTime).getHours(),
      duration: entry.duration || 0,
      completed: entry.taskId ? true : false
    }));

    const hourlyProductivity = completionTimes.reduce((acc, entry) => {
      const hour = entry.hour;
      if (!acc[hour]) {
        acc[hour] = { totalTime: 0, count: 0 };
      }
      acc[hour].totalTime += entry.duration;
      acc[hour].count += 1;
      return acc;
    }, {} as Record<number, { totalTime: number; count: number }>);

    const mostProductiveHour = Object.entries(hourlyProductivity)
      .sort(([,a], [,b]) => b.totalTime - a.totalTime)[0];

    if (mostProductiveHour) {
      suggestions.push({
        type: 'optimal_time',
        message: `You're most productive at ${mostProductiveHour[0]}:00. Consider scheduling important tasks then.`,
        priority: 'medium'
      });
    }

    // Suggest task breaks based on work patterns
    const longTasks = timeEntries.filter(entry => (entry.duration || 0) > 120);
    if (longTasks.length > 3) {
      suggestions.push({
        type: 'break_suggestion',
        message: 'Consider taking breaks between long tasks to maintain productivity.',
        priority: 'high'
      });
    }

    // Suggest category balance
    const categoryCount = userTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.keys(categoryCount);
    if (categories.length > 1) {
      const maxCategory = categories.reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
      );
      
      suggestions.push({
        type: 'category_balance',
        message: `You have many ${maxCategory} tasks. Consider diversifying your workload.`,
        priority: 'low'
      });
    }

    return suggestions;
  }

  static async getDueDateSuggestions(task: any) {
    const suggestions = [];
    
    // Analyze similar tasks completion times
    const similarTasks = await Task.find({
      category: task.category,
      priority: task.priority,
      status: 'completed'
    });

    if (similarTasks.length > 0) {
      const avgCompletionTime = similarTasks.reduce((sum, t) => {
        const created = new Date(t.createdAt);
        const completed = new Date(t.completedAt || t.updatedAt);
        return sum + (completed.getTime() - created.getTime());
      }, 0) / similarTasks.length;

      const suggestedDueDate = new Date();
      suggestedDueDate.setTime(suggestedDueDate.getTime() + avgCompletionTime);

      suggestions.push({
        type: 'due_date',
        message: `Based on similar tasks, consider setting due date to ${suggestedDueDate.toLocaleDateString()}`,
        priority: 'medium',
        data: { suggestedDate: suggestedDueDate }
      });
    }

    return suggestions;
  }
}
```

#### 6.7 Mobile-Responsive Design
**Responsive Layout Component** (`frontend/src/components/ResponsiveLayout.tsx`):
```typescript
import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ children, sidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-lg font-semibold">Task Manager</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebar}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-lg font-semibold">Task Manager</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sidebar}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 hover:text-gray-900"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
```

#### 6.8 Export and Import Features
**Export Service** (`backend/src/services/exportService.ts`):
```typescript
import Task from '../models/Task';
import TimeEntry from '../models/TimeEntry';
import { ObjectId } from 'mongoose';

export class ExportService {
  static async exportTasksToCSV(userId: string) {
    const tasks = await Task.find({ userId: new ObjectId(userId) });
    
    const csvHeaders = 'Title,Description,Category,Priority,Status,Due Date,Created At,Completed At\n';
    const csvRows = tasks.map(task => 
      `"${task.title}","${task.description || ''}","${task.category}","${task.priority}","${task.status}","${task.dueDate || ''}","${task.createdAt}","${task.completedAt || ''}"`
    ).join('\n');
    
    return csvHeaders + csvRows;
  }

  static async exportTasksToJSON(userId: string) {
    const tasks = await Task.find({ userId: new ObjectId(userId) });
    const timeEntries = await TimeEntry.find({ userId: new ObjectId(userId) });
    
    return {
      tasks: tasks.map(task => ({
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        completedAt: task.completedAt
      })),
      timeEntries: timeEntries.map(entry => ({
        taskTitle: entry.taskId?.title || 'Unknown',
        startTime: entry.startTime,
        endTime: entry.endTime,
        duration: entry.duration,
        description: entry.description
      })),
      exportDate: new Date().toISOString()
    };
  }

  static async importTasksFromJSON(userId: string, data: any) {
    const importedTasks = [];
    
    for (const taskData of data.tasks) {
      const task = new Task({
        ...taskData,
        userId: new ObjectId(userId)
      });
      await task.save();
      importedTasks.push(task);
    }
    
    return importedTasks;
  }
}
```

### Phase 7: Performance Optimization and Security (Week 7)

#### 7.1 Caching Implementation
**Redis Cache Service** (`backend/src/services/cacheService.ts`):
```typescript
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });
  }

  async get(key: string): Promise<any> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

export default new CacheService();
```

#### 7.2 Rate Limiting
**Rate Limiting Middleware** (`backend/src/middleware/rateLimiting.ts`):
```typescript
import rateLimit from 'express-rate-limit';

export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const uploadRateLimit = createRateLimit(60 * 60 * 1000, 10); // 10 uploads per hour
```

#### 7.3 Input Validation and Sanitization
**Enhanced Validation Middleware** (`backend/src/middleware/validation.ts`):
```typescript
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Sanitize string fields
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    });
  }
  next();
};

// Validation schemas
export const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  category: Joi.string().min(1).max(50).required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('todo', 'in_progress', 'completed').default('todo'),
  dueDate: Joi.date().iso().allow(null)
});

export const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});
```

## Conclusion

This comprehensive implementation guide now includes advanced features that transform the basic Task Manager into a powerful productivity platform. The advanced features include:

### ✅ **Implemented Advanced Features:**

1. **Real-time Notifications** - WebSocket-based notifications for task updates
2. **Task Templates** - Reusable task templates for common workflows
3. **Time Tracking** - Built-in time tracking with start/stop functionality
4. **Team Collaboration** - Team management and shared task assignment
5. **Advanced Analytics** - Comprehensive productivity metrics and insights
6. **Smart Suggestions** - AI-powered task recommendations and optimizations
7. **Mobile Responsive Design** - Fully responsive layout for all devices
8. **Export/Import** - Data portability with CSV and JSON formats
9. **Performance Optimization** - Redis caching and rate limiting
10. **Enhanced Security** - Input sanitization and validation

### 🚀 **Next Steps:**

1. **Deploy the application** with all advanced features
2. **Set up monitoring** and analytics tracking
3. **Configure CI/CD** pipelines for automated deployment
4. **Implement user feedback** collection system
5. **Add more integrations** (Google Calendar, Slack, etc.)

The application is now enterprise-ready with professional-grade features that provide significant value to users and teams. All features are designed to be scalable, maintainable, and user-friendly.

For questions or clarifications, refer to the individual technology documentation or create issues in the project repository.
