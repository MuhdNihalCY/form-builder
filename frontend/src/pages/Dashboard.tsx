import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTaskStats, fetchTasks } from '../store/slices/taskSlice';
import { fetchCategories, initializeDefaultCategories } from '../store/slices/categorySlice';
import TaskStats from '../components/TaskStats';
import ProductivityChart from '../components/ProductivityChart';
import RecentTasks from '../components/RecentTasks';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, tasks } = useAppSelector((state) => state.tasks);
  const { categories } = useAppSelector((state) => state.categories);

  useEffect(() => {
    // Fetch both stats and tasks for the dashboard
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ limit: 1000 })); // Get all tasks for charts
    
    // Initialize categories if none exist
    if (categories.length === 0) {
      dispatch(fetchCategories()).then((result) => {
        // Check if the fetch was successful but returned empty array
        if (result.type === 'categories/fetchCategories/fulfilled') {
          const categories = (result.payload as any).categories || [];
          if (categories.length === 0) {
            // Initialize default categories if none exist
            dispatch(initializeDefaultCategories());
          }
        } else if (result.type === 'categories/fetchCategories/rejected') {
          // If fetch fails, try to initialize default categories
          dispatch(initializeDefaultCategories());
        }
      });
    }
  }, [dispatch, categories.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your task management and productivity
        </p>
      </div>
      
      <TaskStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityChart />
        <RecentTasks tasks={tasks} />
      </div>
    </div>
  );
};

export default Dashboard;
