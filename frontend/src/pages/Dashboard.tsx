import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTaskStats, fetchTasks } from '../store/slices/taskSlice';
import TaskStats from '../components/TaskStats';
import ProductivityChart from '../components/ProductivityChart';
import RecentTasks from '../components/RecentTasks';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, tasks } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    // Fetch both stats and tasks for the dashboard
    dispatch(fetchTaskStats());
    dispatch(fetchTasks({ limit: 1000 })); // Get all tasks for charts
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
