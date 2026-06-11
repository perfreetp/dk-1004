import { MapPin, Calendar, Plane, User } from 'lucide-react';
import type { Task, Resource, Route } from '@/types';

interface TaskCardProps {
  task: Task;
  pilot?: Resource;
  route?: Route;
  onView?: (id: number) => void;
  onUpdateStatus?: (id: number, status: Task['status']) => void;
}

export function TaskCard({ task, pilot, route, onView, onUpdateStatus }: TaskCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClick = () => {
    if (onView) onView(task.id);
  };

  const handleTakeTask = () => {
    if (onUpdateStatus) onUpdateStatus(task.id, 'active');
  };

  const handleComplete = () => {
    if (onUpdateStatus) onUpdateStatus(task.id, 'completed');
  };

  return (
    <div
      className="card cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{task.name}</h3>
        <span className={`priority-${task.priority}`}>
          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate">{task.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(task.dateTime)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-gray-400" />
          <span>{task.aircraftModel}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span>{pilot?.name || '未指派'}</span>
        </div>
      </div>

      {route && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>航线: {route.name}</span>
            <span>{route.totalDistance} km / {route.estimatedTime} min</span>
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {task.status === 'pending' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTakeTask();
            }}
            className="flex-1 btn-primary text-sm py-1.5"
          >
            领取任务
          </button>
        )}
        {task.status === 'active' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
            className="flex-1 btn-accent text-sm py-1.5"
          >
            完成任务
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onView) onView(task.id);
          }}
          className="flex-1 btn-secondary text-sm py-1.5"
        >
          详情
        </button>
      </div>
    </div>
  );
}
