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
    if (tasks.length > 0) {
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

      setChartData({
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
      });
    }
  }, [tasks]);

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

  if (!chartData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProductivityChart;
