import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/slices/taskSlice';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector((state) => state.tasks);
  
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
  });

  // Memoize the filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters]);

  useEffect(() => {
    dispatch(fetchTasks(memoizedFilters));
  }, [dispatch, memoizedFilters]);

  const handleCreateTask = async (taskData: any) => {
    try {
      await dispatch(createTask(taskData)).unwrap();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (id: string, taskData: any) => {
    try {
      await dispatch(updateTask({ id, taskData })).unwrap();
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(id)).unwrap();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleStatusChange = async (id: string, status: 'todo' | 'in_progress' | 'completed') => {
    try {
      await dispatch(updateTask({ id, taskData: { status } })).unwrap();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your tasks and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              placeholder="Filter by category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tasks found</p>
          <p className="text-gray-400 text-sm mt-2">
            Create your first task to get started
          </p>
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(taskData) => handleUpdateTask(editingTask._id, taskData)}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};

export default Tasks;
