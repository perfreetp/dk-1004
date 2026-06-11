import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Calendar, User, Battery, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Resource } from '@/types';

type ResourceType = 'pilot' | 'equipment' | 'battery';

export function ResourceCalendar() {
  const { getPilots, getEquipments, getBatteries } = useTaskStore();
  const [activeTab, setActiveTab] = useState<ResourceType>('pilot');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevMonthDay = new Date(year, month, -i);
      days.push({
        date: prevMonthDay.getDate(),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const today = new Date();
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: today.getDate() === i && today.getMonth() === month && today.getFullYear() === year,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
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

  const resources = getResources();
  const Icon = getResourceIcon(activeTab);

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
            onClick={() => setActiveTab('pilot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'pilot' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>飞手</span>
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'equipment' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>设备</span>
          </button>
          <button
            onClick={() => setActiveTab('battery')}
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
            <div className="flex items-center justify-between mb-4">
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
              {getMonthDays().map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                    day.isToday ? 'bg-primary-100 text-primary-600 font-medium' : ''
                  } ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {day.date}
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
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {activeTab === 'pilot' ? '飞手列表' : activeTab === 'equipment' ? '设备列表' : '电池列表'}
          </h3>
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
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
                    {resource.lastMaintenance && (
                      <p className="text-xs text-gray-500">上次维护: {resource.lastMaintenance}</p>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(resource.status)}`}>
                  {resource.status === 'available' ? '可用' : resource.status === 'unavailable' ? '不可用' : '使用中'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
