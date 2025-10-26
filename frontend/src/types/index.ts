export interface User {
  id: string;
  email: string;
  name: string;
  role: 'individual' | 'team_member' | 'team_admin';
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  isDefault: boolean;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatus {
  _id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  isDefault: boolean;
  isCompleted: boolean;
  isActive: boolean;
  userId: string;
  workflowId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskLevel {
  _id: string;
  name: string;
  description?: string;
  level: number;
  color: string;
  icon?: string;
  isDefault: boolean;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  _id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  userId: string;
  statuses: Array<{
    statusId: string;
    order: number;
    isRequired: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: string; // Dynamic status name
  statusId?: string; // Reference to TaskStatus
  level: number; // Dynamic level number
  levelId?: string; // Reference to TaskLevel
  workflowId?: string; // Reference to Workflow
  dueDate?: string;
  userId: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}
