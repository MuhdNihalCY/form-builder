import React, { useEffect, useState } from 'react';
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
import { useAppSelector } from '../hooks/redux';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ProductivityChart: React.FC = () => {
  const { tasks } = useAppSelector((state) => state.tasks);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    console.log('ProductivityChart: tasks received:', tasks.length);
    console.log('Tasks data:', tasks);
    
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
      const dayTasks = tasks.filter(task => 
        task.status === 'completed' && 
        task.completedAt && 
        task.completedAt.split('T')[0] === day
      );
      console.log(`Day ${day}: ${dayTasks.length} completed tasks`);
      return dayTasks.length;
    });

    console.log('Completed tasks by day:', completedTasksByDay);
    console.log('Total completed tasks:', tasks.filter(t => t.status === 'completed').length);
    console.log('Tasks with completedAt:', tasks.filter(t => t.completedAt).length);

    const chartDataConfig = {
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

    console.log('Chart data config:', chartDataConfig);
    setChartData(chartDataConfig);
  }, [tasks]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
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

  if (!chartData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const hasData = chartData.datasets[0].data.some((value: number) => value > 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trends (Last 7 Days)</h3>
      {hasData ? (
        <Bar data={chartData} options={options} />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium">No completed tasks yet</p>
          <p className="text-sm">Complete some tasks to see your productivity trends</p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Total tasks: {tasks.length}</p>
            <p>Completed tasks: {tasks.filter(t => t.status === 'completed').length}</p>
            <p>Tasks with completion date: {tasks.filter(t => t.completedAt).length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityChart;
