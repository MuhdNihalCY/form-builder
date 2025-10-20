import React from 'react';
import { TaskStats as TaskStatsType } from '../types';

interface TaskStatsProps {
  stats: TaskStatsType | null;
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const statsCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      color: 'bg-blue-500',
      icon: '📋',
    },
    {
      title: 'Completed',
      value: stats.completedTasks,
      color: 'bg-green-500',
      icon: '✅',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks,
      color: 'bg-yellow-500',
      icon: '🔄',
    },
    {
      title: 'To Do',
      value: stats.todoTasks,
      color: 'bg-gray-500',
      icon: '📝',
    },
    {
      title: 'High Priority',
      value: stats.highPriorityTasks,
      color: 'bg-red-500',
      icon: '🔥',
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks,
      color: 'bg-orange-500',
      icon: '⚠️',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.title}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion Rate */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Completion Rate
          </h3>
          <div className="mt-5">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-green-500 h-8 rounded-full flex items-center justify-center"
                    style={{ width: `${completionRate}%` }}
                  >
                    <span className="text-white text-sm font-medium">
                      {completionRate}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <span className="text-sm text-gray-500">
                  {stats.completedTasks} of {stats.totalTasks} tasks completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
