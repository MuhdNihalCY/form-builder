# Task Manager Dashboard

A full-stack web application for managing tasks with productivity tracking and analytics.

## 🚀 Features

### Core Features
- ✅ **User Authentication** - Secure signup/login with JWT tokens
- ✅ **Task Management** - Create, read, update, delete tasks
- ✅ **Task Categorization** - Organize tasks by categories
- ✅ **Priority Levels** - Set task priorities (low, medium, high)
- ✅ **Status Tracking** - Track task status (todo, in-progress, completed)
- ✅ **Due Dates** - Set and track task deadlines
- ✅ **Dashboard Analytics** - Visualize productivity with charts
- ✅ **Task Statistics** - Overview of task completion rates
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### Technical Features
- 🔐 **Security** - Password hashing, JWT authentication, CORS protection
- 📊 **Real-time Updates** - Live dashboard updates
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 📱 **Mobile-First** - Optimized for all screen sizes
- ⚡ **Performance** - Optimized queries and caching
- 🧪 **Type Safety** - Full TypeScript implementation

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Joi** for input validation

### Development Tools
- **ESLint** and **Prettier** for code quality
- **Nodemon** for development
- **Git** for version control

## 📁 Project Structure

```
task_manager/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Redux store
│   │   ├── services/       # API calls
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task_manager
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```
   
   Or install individually:
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/task_manager
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   FRONTEND_URL=http://localhost:3001
   ```

   **Frontend** (`frontend/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:5001/api
   PORT=3001
   ```

### Running the Application

#### Option 1: Single Command (Recommended)
```bash
# Install all dependencies and start both servers
npm run dev
```

#### Option 2: Using Startup Scripts
```bash
# Linux/Mac
./start.sh

# Windows
start.bat
```

#### Option 3: Manual Start
1. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

2. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:5001`

3. **Start the frontend development server**
   ```bash
   cd frontend
   npm start
   ```
   The app will be available at `http://localhost:3001`

### Access URLs
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/health

## 📖 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication)

### Task Endpoints

#### GET `/api/tasks`
Get all tasks for authenticated user
- Query parameters: `status`, `category`, `priority`, `page`, `limit`

#### POST `/api/tasks`
Create a new task
```json
{
  "title": "Complete project",
  "description": "Finish the task manager project",
  "category": "Work",
  "priority": "high",
  "status": "todo",
  "dueDate": "2024-01-15"
}
```

#### PUT `/api/tasks/:id`
Update a task

#### DELETE `/api/tasks/:id`
Delete a task

#### GET `/api/tasks/stats/overview`
Get task statistics for dashboard

## 🎯 Usage

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Create tasks** with titles, descriptions, categories, and priorities
3. **Track progress** by updating task status (todo → in-progress → completed)
4. **Monitor productivity** through the dashboard analytics
5. **Filter tasks** by status, category, or priority

### Dashboard Features
- **Task Statistics** - Overview of total, completed, in-progress, and overdue tasks
- **Completion Rate** - Visual progress bar showing completion percentage
- **Productivity Chart** - 7-day trend of completed tasks
- **Priority Overview** - Breakdown of high-priority tasks
- **Overdue Alerts** - Tasks that are past their due date

## 🔧 Development

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Code Quality
- **ESLint** - Code linting and style enforcement
- **Prettier** - Code formatting
- **TypeScript** - Type checking
- **Git Hooks** - Pre-commit checks

## 🚀 Deployment

### Backend Deployment (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Frontend Deployment (Vercel)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy automatically on push

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components
- End-to-end tests for user workflows

## 🔒 Security

### Implemented Security Measures
- **Password Hashing** - bcryptjs with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Joi schema validation
- **CORS Protection** - Configured allowed origins
- **Helmet** - Security headers
- **Rate Limiting** - API request limiting

### Security Best Practices
- Never commit secrets to version control
- Use environment variables for sensitive data
- Implement proper error handling
- Validate all user inputs
- Use HTTPS in production

## 📊 Performance

### Optimization Features
- **Database Indexing** - Optimized queries
- **Pagination** - Limit large result sets
- **Caching** - Reduce redundant API calls
- **Code Splitting** - Lazy load components
- **Image Optimization** - Compressed assets

### Performance Metrics
- Dashboard load time < 2 seconds
- Task list queries < 500ms for 1000+ tasks
- API response times < 200ms average
- Bundle size < 1MB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

**Database Connection Error:**
- Ensure MongoDB is running
- Check connection string in environment variables
- Verify network connectivity

**Authentication Issues:**
- Check JWT secret is set
- Verify token expiration settings
- Ensure CORS is properly configured

**Build Errors:**
- Clear node_modules and reinstall dependencies
- Check Node.js version compatibility
- Verify environment variables are set

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Create a new issue with detailed description
- Include error logs and environment details

## 🎉 Acknowledgments

- React team for the amazing framework
- MongoDB team for the database
- Tailwind CSS for the styling system
- Chart.js for data visualization
- All contributors and users

---

**Happy Task Managing! 🚀**
