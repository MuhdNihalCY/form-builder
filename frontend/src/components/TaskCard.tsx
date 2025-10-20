import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'todo' | 'in_progress' | 'completed') => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
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
        <p className="text-gray-600 mb-4 line-clamp-3">{task.description}</p>
      )}
      
      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-500">
          <span className="font-medium">Category:</span> {task.category}
        </div>
        {task.dueDate && (
          <div className={`text-sm ${isOverdue(task.dueDate, task.status) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            <span className="font-medium">Due:</span> {formatDate(task.dueDate)}
            {isOverdue(task.dueDate, task.status) && ' (Overdue)'}
          </div>
        )}
        {task.completedAt && (
          <div className="text-sm text-green-600">
            <span className="font-medium">Completed:</span> {formatDate(task.completedAt)}
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value as 'todo' | 'in_progress' | 'completed')}
          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          
          <button
            onClick={() => onDelete(task._id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
