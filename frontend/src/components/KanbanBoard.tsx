import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { Task } from '../types';
import { updateTask } from '../store/slices/taskSlice';

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  color: string;
}

const KanbanBoard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks = [] } = useAppSelector((state) => state.tasks);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  
  // Define columns based on task statuses
  const columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', status: 'To Do', color: '#6B7280' },
    { id: 'in_progress', title: 'In Progress', status: 'In Progress', color: '#F59E0B' },
    { id: 'review', title: 'Review', status: 'Review', color: '#3B82F6' },
    { id: 'completed', title: 'Completed', status: 'Completed', color: '#10B981' },
    { id: 'on_hold', title: 'On Hold', status: 'On Hold', color: '#EF4444' },
  ];

  // Get unique statuses from tasks (handle undefined/null tasks)
  const taskStatuses = Array.from(new Set((tasks || []).map(task => task && task.status).filter(Boolean)));
  
  // Create a map of status normalization (handle different casing/variations)
  const statusMap: Record<string, string> = {
    'todo': 'To Do',
    'to do': 'To Do',
    'To Do': 'To Do',
    'in_progress': 'In Progress',
    'in progress': 'In Progress',
    'In Progress': 'In Progress',
    'completed': 'Completed',
    'Completed': 'Completed',
    'review': 'Review',
    'Review': 'Review',
    'on_hold': 'On Hold',
    'on hold': 'On Hold',
    'On Hold': 'On Hold',
  };
  
  // Always show all predefined columns for consistency
  const allColumns = columns;

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create a visual feedback element
    const dragImage = document.createElement('div');
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.innerHTML = task.title;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedTask && draggedTask.status !== targetStatus) {
      try {
        await dispatch(
          updateTask({
            id: draggedTask._id,
            taskData: { status: targetStatus },
          })
        ).unwrap();
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
    
    handleDragEnd();
  };

  const getTasksByStatus = (status: string) => {
    if (!tasks || tasks.length === 0) return [];
    // Normalize status and match tasks (handle different casing/variations)
    return tasks.filter((task) => {
      if (!task || !task.status) return false;
      const normalizedStatus = statusMap[task.status.toLowerCase()] || task.status;
      return normalizedStatus === status || task.status === status;
    });
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
        <p className="text-sm text-gray-500">Drag and drop tasks to change their status</p>
      </div>

      <div className="overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="inline-flex gap-4 min-w-max">
          {allColumns.map((column) => {
            const columnTasks = getTasksByStatus(column.status);
            const isDraggedOver = draggedOverColumn === column.id;
            
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                getPriorityClass={getPriorityClass}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDraggedOver={isDraggedOver}
                setDraggedOverColumn={setDraggedOverColumn}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  column: KanbanColumn;
  tasks: Task[];
  getPriorityClass: (priority: string) => string;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragEnd: () => void;
  isDraggedOver: boolean;
  setDraggedOverColumn: (columnId: string | null) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  getPriorityClass,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDraggedOver,
  setDraggedOverColumn,
}) => {
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverColumn(column.id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOverColumn(null);
  };

  return (
    <div
      className={`bg-gray-50 rounded-lg shadow-md border-2 border-dashed min-w-[280px] w-[280px] transition-all duration-200 ${
        isDraggedOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onDragOver={(e) => {
        onDragOver(e);
        handleDragEnter(e);
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        onDrop(e, column.status);
        setDraggedOverColumn(null);
      }}
      style={{
        borderTopWidth: '4px',
        borderTopColor: isDraggedOver ? '#3B82F6' : column.color,
      }}
    >
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Tasks */}
      <div className="px-3 pb-3 space-y-2 max-h-[600px] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              draggable
              onDragStart={(e) => onDragStart(e, task)}
              onDragEnd={onDragEnd}
              className={`bg-white rounded-md shadow-sm border-l-4 p-3 hover:shadow-md transition-shadow cursor-move ${getPriorityClass(task.priority)}`}
              style={{ 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
              }}
            >
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                  {task.category}
                </span>
                {task.dueDate && (
                  <span className="text-gray-400">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;