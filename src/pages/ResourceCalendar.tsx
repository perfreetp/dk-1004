import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Calendar, User, Battery, Cpu, ChevronLeft, ChevronRight, X, Clock, MapPin } from 'lucide-react';
import type { Resource, Task } from '@/types';

type ResourceType = 'pilot' | 'equipment' | 'battery';

interface DayCell {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

export function ResourceCalendar() {
  const { getPilots, getEquipments, getBatteries, tasks, getRouteById } = useTaskStore();
  const [activeTab, setActiveTab] = useState<ResourceType>('pilot');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);

  const getResources = (): Resource[] => {
    switch (activeTab) {
      case 'pilot':
        return getPilots();
      case 'equipment':
        return getEquipments();
      case 'battery':
        return getBatteries();
      default:
        return [];
    }
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'pilot':
        return User;
      case 'equipment':
        return Cpu;
      case 'battery':
        return Battery;
    }
  };

  const getStatusColor = (status: Resource['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'unavailable':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getMonthDays = (): DayCell[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: DayCell[] = [];

    const today = new Date();
    const todayStr = today.toLocaleDateString('zh-CN');

    const resourceTasks = selectedResource 
      ? tasks.filter(t => {
          if (selectedResource.type === 'pilot') {
            return t.pilotId === selectedResource.id;
          }
          return false;
        })
      : tasks;

    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevMonthDay = new Date(year, month, -i);
      const dateStr = prevMonthDay.toLocaleDateString('zh-CN');
      days.push({
        date: prevMonthDay.getDate(),
        isCurrentMonth: false,
        isToday: false,
        tasks: resourceTasks.filter(t => new Date(t.dateTime).toLocaleDateString('zh-CN') === dateStr),
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = dayDate.toLocaleDateString('zh-CN');
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        tasks: resourceTasks.filter(t => new Date(t.dateTime).toLocaleDateString('zh-CN') === dateStr),
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      const dateStr = nextMonthDay.toLocaleDateString('zh-CN');
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        tasks: resourceTasks.filter(t => new Date(t.dateTime).toLocaleDateString('zh-CN') === dateStr),
      });
    }

    return days;
  };

  const getWeekDays = () => ['日', '一', '二', '三', '四', '五', '六'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatMonth = () => {
    return currentDate.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  const handleDateClick = (day: DayCell) => {
    if (day.tasks.length > 0) {
      const year = day.isCurrentMonth 
        ? currentDate.getFullYear() 
        : day.date < 15 
          ? currentDate.getFullYear() 
          : currentDate.getFullYear() + (day.date < 15 ? -1 : 1);
      const month = day.isCurrentMonth 
        ? currentDate.getMonth() 
        : day.date < 15 
          ? currentDate.getMonth() - 1 
          : currentDate.getMonth() + 1;
      const dateStr = new Date(year, month, day.date).toLocaleDateString('zh-CN');
      setSelectedDate(dateStr);
      setShowDateModal(true);
    }
  };

  const resources = getResources();
  const Icon = getResourceIcon(activeTab);
  const monthDays = getMonthDays();

  const getDateTasks = (date: string) => {
    return tasks.filter(t => new Date(t.dateTime).toLocaleDateString('zh-CN') === date);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">资源日历</h2>
          <p className="text-gray-500 mt-1">查看飞手、设备和电池的占用情况</p>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
          <button
            onClick={() => {
              setActiveTab('pilot');
              setSelectedResource(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'pilot' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>飞手</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('equipment');
              setSelectedResource(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'equipment' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>设备</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('battery');
              setSelectedResource(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'battery' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Battery className="w-4 h-4" />
            <span>电池</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-3">
          <div className="card">
            {selectedResource && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{selectedResource.name}</p>
                    <p className="text-sm text-blue-600">查看该资源的任务安排</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResource(null)}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-blue-600" />
                </button>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4 p-4">
              <button
                onClick={goToPrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatMonth()}
              </h3>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {getWeekDays().map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
                    day.isToday ? 'bg-primary-100 text-primary-600 font-medium' : ''
                  } ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'} ${
                    day.tasks.length > 0 ? 'bg-blue-50 cursor-pointer hover:bg-blue-100' : ''
                  }`}
                >
                  {day.date}
                  {day.tasks.length > 0 && (
                    <div className="absolute top-1 right-1">
                      <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                        {day.tasks.length > 9 ? '9+' : day.tasks.length}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-200 rounded-full"></span>
                  <span className="text-gray-600">可用</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-200 rounded-full"></span>
                  <span className="text-gray-600">不可用</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-200 rounded-full"></span>
                  <span className="text-gray-600">使用中</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">1</span>
                  <span className="text-gray-600">有任务安排</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {activeTab === 'pilot' ? '飞手列表' : activeTab === 'equipment' ? '设备列表' : '电池列表'}
          </h3>
          {resources.map((resource) => {
            const resourceTasks = tasks.filter(t => {
              if (resource.type === 'pilot') {
                return t.pilotId === resource.id;
              }
              return false;
            });
            
            const hasTasks = resourceTasks.length > 0;
            
            return (
              <div
                key={resource.id}
                onClick={() => setSelectedResource(resource)}
                className={`card cursor-pointer transition-all ${
                  selectedResource?.id === resource.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{resource.name}</p>
                      {resource.batteryLevel !== undefined && (
                        <p className="text-xs text-gray-500">电量: {resource.batteryLevel}%</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                    {resource.status === 'available' ? '可用' : resource.status === 'unavailable' ? '不可用' : '使用中'}
                  </span>
                </div>
                {hasTasks && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Calendar className="w-3 h-3" />
                    <span>{resourceTasks.length} 个任务安排</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showDateModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{selectedDate} 的任务安排</h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {getDateTasks(selectedDate).map((task) => {
                const route = getRouteById(task.routeId);
                return (
                  <div key={task.id} className="card">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{task.name}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(task.dateTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {task.location}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.status === 'pending' ? 'status-pending' :
                        task.status === 'active' ? 'status-active' : 'status-completed'
                      }`}>
                        {task.status === 'pending' ? '待派发' : task.status === 'active' ? '执行中' : '已完成'}
                      </span>
                    </div>
                    {route && (
                      <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500">
                        航线: {route.name} ({route.totalDistance} km)
                      </div>
                    )}
                  </div>
                );
              })}
              {getDateTasks(selectedDate).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>当天没有任务安排</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
