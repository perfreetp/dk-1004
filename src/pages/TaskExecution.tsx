import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { ArrowLeft, MapPin, Calendar, Plane, User, AlertTriangle, Camera, Clock, CheckCircle } from 'lucide-react';
import type { Exception } from '@/types';

interface TaskExecutionProps {
  taskId: number;
  onBack: () => void;
}

const exceptionTypes = ['天气异常', '设备故障', '信号丢失', '电量不足', '人为因素', '其他'];

export function TaskExecution({ taskId, onBack }: TaskExecutionProps) {
  const { getTaskById, getPilots, getRouteById, exceptions, addException, addPhoto, updateTask } = useTaskStore();
  const task = getTaskById(taskId);
  const pilot = task ? getPilots().find((p) => p.id === task.pilotId) : undefined;
  const route = task ? getRouteById(task.routeId) : undefined;
  const taskExceptions = exceptions.filter((e) => e.taskId === taskId);

  const [newException, setNewException] = useState({
    type: '',
    description: '',
  });

  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleAddException = () => {
    if (!newException.type || !newException.description.trim()) return;
    
    addException({
      taskId,
      type: newException.type,
      description: newException.description,
      occurredAt: new Date().toISOString(),
      handled: false,
    });
    
    setNewException({ type: '', description: '' });
    setShowExceptionForm(false);
  };

  const handleAddPhoto = () => {
    const randomPhoto = `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=drone%20aerial%20photography%20landscape%20${Math.random().toString(36).substr(2, 9)}&image_size=landscape_16_9`;
    
    addPhoto({
      taskId,
      filePath: randomPhoto,
      caption: photoCaption || '现场照片',
    });
    
    setPhotoCaption('');
  };

  const handleTakeoff = () => {
    if (task) {
      updateTask(taskId, { 
        status: 'active',
        takeoffTime: new Date().toISOString() 
      });
    }
  };

  const handleLanding = () => {
    if (task) {
      updateTask(taskId, { 
        status: 'completed',
        landingTime: new Date().toISOString() 
      });
    }
  };

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">任务不存在</p>
          <button onClick={onBack} className="mt-4 btn-primary">返回看板</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回看板</span>
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <h2 className="text-2xl font-bold text-gray-900">任务执行</h2>
        <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
          task.status === 'pending' ? 'status-pending' : 
          task.status === 'active' ? 'status-active' : 'status-completed'
        }`}>
          {task.status === 'pending' ? '待派发' : task.status === 'active' ? '执行中' : '已完成'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">任务信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  任务地点
                </label>
                <p className="text-gray-900">{task.location}</p>
              </div>
              <div>
                <label className="form-label flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  计划时间
                </label>
                <p className="text-gray-900">{formatDate(task.dateTime)}</p>
              </div>
              <div>
                <label className="form-label flex items-center gap-1">
                  <Plane className="w-4 h-4" />
                  机型
                </label>
                <p className="text-gray-900">{task.aircraftModel}</p>
              </div>
              <div>
                <label className="form-label flex items-center gap-1">
                  <User className="w-4 h-4" />
                  飞行员
                </label>
                <p className="text-gray-900">{pilot?.name || '未指派'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">航线信息</h3>
              {route && route.riskPoints.length > 0 && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{route.riskPoints.length} 个风险点</span>
                </div>
              )}
            </div>
            {route ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">航线名称:</span>
                    <span className="ml-2 font-semibold">{route.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">总里程:</span>
                    <span className="ml-2 font-semibold">{route.totalDistance} km</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">途经点</h4>
                  <div className="space-y-2">
                    {route.waypoints.map((wp, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span>{wp.name}</span>
                        <span className="text-gray-400">{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">未关联航线</p>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">执行记录</h3>
              {task.status !== 'completed' && (
                <div className="flex gap-2">
                  {!task.takeoffTime && (
                    <button onClick={handleTakeoff} className="btn-primary flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      记录起飞
                    </button>
                  )}
                  {task.takeoffTime && !task.landingTime && (
                    <button onClick={handleLanding} className="btn-accent flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      记录返航
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">起飞时间</span>
                </div>
                <p className="font-semibold text-gray-900">{formatDate(task.takeoffTime)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">返航时间</span>
                </div>
                <p className="font-semibold text-gray-900">{formatDate(task.landingTime)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">异常数量</span>
                </div>
                <p className="font-semibold text-gray-900">{taskExceptions.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">异常记录</h3>
            {taskExceptions.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无异常记录</p>
            ) : (
              <div className="space-y-3">
                {taskExceptions.map((ex: Exception) => (
                  <div key={ex.id} className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-red-700">{ex.type}</span>
                      <span className="text-xs text-gray-500">{formatDate(ex.occurredAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{ex.description}</p>
                    <span className={`mt-2 inline-block text-xs px-2 py-1 rounded-full ${
                      ex.handled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ex.handled ? '已处理' : '待处理'}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {task.status !== 'completed' && (
              <button
                onClick={() => setShowExceptionForm(true)}
                className="mt-4 w-full btn-secondary flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                添加异常
              </button>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">现场照片</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="照片描述"
                  className="flex-1 form-input text-sm"
                />
                <button onClick={handleAddPhoto} className="btn-primary flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  拍摄
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={`https://neeko-copilot.bytedance.net/api/text_to_image?prompt=drone%20photography%20industrial%20inspection%20${i}&image_size=landscape_16_9`}
                      alt={`现场照片 ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showExceptionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">添加异常记录</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">异常类型</label>
                <select
                  value={newException.type}
                  onChange={(e) => setNewException((prev) => ({ ...prev, type: e.target.value }))}
                  className="form-select"
                >
                  <option value="">请选择异常类型</option>
                  {exceptionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">详细描述</label>
                <textarea
                  value={newException.description}
                  onChange={(e) => setNewException((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="请描述异常情况..."
                  rows={3}
                  className="form-input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExceptionForm(false)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleAddException} className="btn-primary">
                  添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
