import { useState, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { ArrowLeft, MapPin, Calendar, Plane, User, Battery, AlertTriangle, Camera, Clock, CheckCircle, X, Trash2, Edit3, Save, Cancel, Tag } from 'lucide-react';
import type { Exception, Photo } from '@/types';

interface TaskExecutionProps {
  taskId: number;
  onBack: () => void;
}

const exceptionTypes = ['天气异常', '设备故障', '信号丢失', '电量不足', '人为因素', '其他'];

const aircraftModels = [
  'DJI Mavic 3',
  'DJI Phantom 4 RTK',
  'DJI Matrice 300',
  'DJI Inspire 3',
  'DJI Mini 3 Pro',
];

const payloadTypes = ['巡检', '拍摄', '物资投送', '测绘', '其他'];

export function TaskExecution({ taskId, onBack }: TaskExecutionProps) {
  const { getTaskById, getPilots, getEquipments, getBatteries, getRouteById, exceptions, addException, updateException, addPhoto, getPhotosByTaskId, deletePhoto, updateTask, getRoutes } = useTaskStore();
  const task = getTaskById(taskId);
  const pilot = task ? getPilots().find((p) => p.id === task.pilotId) : undefined;
  const equipment = task ? getEquipments().find((e) => e.id === task.equipmentId) : undefined;
  const battery = task ? getBatteries().find((b) => b.id === task.batteryId) : undefined;
  const route = task ? getRouteById(task.routeId) : undefined;
  const taskExceptions = exceptions.filter((e) => e.taskId === taskId);
  const taskPhotos = getPhotosByTaskId(taskId);
  
  const normalPhotos = taskPhotos.filter(p => p.category === 'normal');
  const exceptionPhotos = taskPhotos.filter(p => p.category === 'exception');

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    dateTime: task?.dateTime || '',
    pilotId: task?.pilotId.toString() || '',
    equipmentId: task?.equipmentId.toString() || '',
    batteryId: task?.batteryId.toString() || '',
    routeId: task?.routeId.toString() || '',
  });
  
  const [newException, setNewException] = useState({
    type: '',
    description: '',
  });

  const [handleException, setHandleException] = useState<Exception | null>(null);
  const [handleForm, setHandleForm] = useState({
    handledBy: '',
    handledResult: '',
  });

  const [photoCaption, setPhotoCaption] = useState('');
  const [photoCategory, setPhotoCategory] = useState<'normal' | 'exception'>('normal');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availablePilots = getPilots().filter(p => p.status === 'available' || (task && p.id === task.pilotId));
  const availableEquipments = getEquipments().filter(e => e.status === 'available' || (task && e.id === task.equipmentId));
  const availableBatteries = getBatteries().filter(b => b.status === 'available' || (task && b.id === task.batteryId));
  const routes = getRoutes();

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

  const formatDateTimeLocal = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
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

  const handleUpdateException = () => {
    if (!handleException || !handleForm.handledBy.trim() || !handleForm.handledResult.trim()) return;
    
    updateException(handleException.id, {
      handledBy: handleForm.handledBy,
      handledResult: handleForm.handledResult,
    });
    
    setHandleException(null);
    setHandleForm({ handledBy: '', handledResult: '' });
  };

  const handleAddGeneratedPhoto = () => {
    const randomPhoto = `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=drone%20aerial%20photography%20industrial%20inspection%20${Date.now()}&image_size=landscape_16_9`;
    
    addPhoto({
      taskId,
      filePath: randomPhoto,
      caption: photoCaption || '现场照片',
      category: photoCategory,
    });
    
    setPhotoCaption('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        addPhoto({
          taskId,
          filePath: result,
          caption: photoCaption || file.name,
          category: photoCategory,
        });
      };
      reader.readAsDataURL(file);
    });
    
    setPhotoCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (photoId: number) => {
    deletePhoto(photoId);
    setShowDeleteConfirm(null);
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

  const handleSaveEdit = () => {
    setErrorMessage('');
    
    const updates: Partial<typeof task> = {};
    if (editData.dateTime !== task?.dateTime) {
      updates.dateTime = editData.dateTime;
    }
    if (parseInt(editData.pilotId) !== task?.pilotId) {
      updates.pilotId = parseInt(editData.pilotId);
    }
    if (parseInt(editData.equipmentId) !== task?.equipmentId) {
      updates.equipmentId = parseInt(editData.equipmentId);
    }
    if (parseInt(editData.batteryId) !== task?.batteryId) {
      updates.batteryId = parseInt(editData.batteryId);
    }
    if (parseInt(editData.routeId) !== task?.routeId) {
      updates.routeId = parseInt(editData.routeId);
    }

    if (Object.keys(updates).length > 0) {
      const result = updateTask(taskId, updates);
      if (!result.success) {
        setErrorMessage(result.conflicts?.join('\n') || '保存失败');
        return;
      }
    }
    
    setIsEditing(false);
  };

  const canEditResources = task?.status === 'pending';

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
        {task.status !== 'completed' && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-auto flex items-center gap-2 btn-secondary"
          >
            {isEditing ? <Cancel className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? '取消编辑' : '编辑任务'}
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}

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
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={formatDateTimeLocal(editData.dateTime)}
                    onChange={(e) => setEditData(prev => ({ ...prev, dateTime: e.target.value + ':00' }))}
                    className="form-input"
                  />
                ) : (
                  <p className="text-gray-900">{formatDate(task.dateTime)}</p>
                )}
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
                {isEditing && canEditResources ? (
                  <select
                    value={editData.pilotId}
                    onChange={(e) => setEditData(prev => ({ ...prev, pilotId: e.target.value }))}
                    className="form-select"
                  >
                    {availablePilots.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{pilot?.name || '未指派'}</p>
                )}
              </div>
              <div>
                <label className="form-label flex items-center gap-1">
                  <Plane className="w-4 h-4" />
                  设备
                </label>
                {isEditing && canEditResources ? (
                  <select
                    value={editData.equipmentId}
                    onChange={(e) => setEditData(prev => ({ ...prev, equipmentId: e.target.value }))}
                    className="form-select"
                  >
                    {availableEquipments.map(e => (
                      <option key={e.id} value={e.id}>{e.name} (电量: {e.batteryLevel}%)</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{equipment?.name || '未分配'}</p>
                )}
              </div>
              <div>
                <label className="form-label flex items-center gap-1">
                  <Battery className="w-4 h-4" />
                  电池
                </label>
                {isEditing && canEditResources ? (
                  <select
                    value={editData.batteryId}
                    onChange={(e) => setEditData(prev => ({ ...prev, batteryId: e.target.value }))}
                    className="form-select"
                  >
                    {availableBatteries.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (电量: {b.batteryLevel}%)</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{battery?.name || '未分配'} {battery?.batteryLevel !== undefined && `(${battery.batteryLevel}%)`}</p>
                )}
              </div>
            </div>
            
            {isEditing && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="form-label">航线选择</label>
                <select
                  value={editData.routeId}
                  onChange={(e) => setEditData(prev => ({ ...prev, routeId: e.target.value }))}
                  className="form-select"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.totalDistance} km / {r.estimatedTime} min)</option>
                  ))}
                </select>
              </div>
            )}

            {isEditing && (
              <div className="mt-4 flex gap-2">
                <button onClick={handleSaveEdit} className="btn-primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存修改
                </button>
                <button onClick={() => {
                  setIsEditing(false);
                  setEditData({
                    dateTime: task.dateTime,
                    pilotId: task.pilotId.toString(),
                    equipmentId: task.equipmentId.toString(),
                    batteryId: task.batteryId.toString(),
                    routeId: task.routeId.toString(),
                  });
                }} className="btn-secondary">
                  取消
                </button>
              </div>
            )}
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
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {taskExceptions.map((ex: Exception) => (
                  <div key={ex.id} className={`p-3 rounded-lg ${ex.handled ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${ex.handled ? 'text-green-700' : 'text-red-700'}`}>{ex.type}</span>
                      <span className="text-xs text-gray-500">{formatDate(ex.occurredAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{ex.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        ex.handled ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {ex.handled ? '已处理' : '待处理'}
                      </span>
                      {!ex.handled && task.status !== 'completed' && (
                        <button
                          onClick={() => {
                            setHandleException(ex);
                            setHandleForm({ handledBy: '', handledResult: '' });
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          处理
                        </button>
                      )}
                    </div>
                    {ex.handled && ex.handledBy && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          处理人: {ex.handledBy} | 结果: {ex.handledResult} | {formatDate(ex.handledAt)}
                        </p>
                      </div>
                    )}
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
            <h3 className="font-semibold text-gray-900 mb-4">现场相册</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="照片描述"
                  className="flex-1 form-input text-sm"
                />
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setPhotoCategory('normal')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      photoCategory === 'normal' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    普通
                  </button>
                  <button
                    onClick={() => setPhotoCategory('exception')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      photoCategory === 'exception' ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    异常
                  </button>
                </div>
                <button onClick={handleAddGeneratedPhoto} className="btn-primary flex items-center gap-2 text-sm px-3">
                  <Camera className="w-4 h-4" />
                  拍摄
                </button>
                <label className="btn-secondary flex items-center gap-2 text-sm px-3 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  上传
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              {normalPhotos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">普通照片 ({normalPhotos.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {normalPhotos.map((photo: Photo) => (
                      <div 
                        key={photo.id} 
                        className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group"
                      >
                        <img
                          src={photo.filePath}
                          alt={photo.caption || '现场照片'}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedPhoto(photo.filePath)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">查看大图</span>
                        </div>
                        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                          <p className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate max-w-[70%]">
                            {photo.caption || '现场照片'}
                          </p>
                          <button
                            onClick={() => setShowDeleteConfirm(showDeleteConfirm === photo.id ? null : photo.id)}
                            className="p-1 text-white bg-black/50 rounded hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {showDeleteConfirm === photo.id && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 rounded-b-lg">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="text-red-400 text-xs px-2 py-1 hover:text-red-300"
                              >
                                确认删除
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="text-white text-xs px-2 py-1 hover:text-gray-300"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {exceptionPhotos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-gray-500">异常照片 ({exceptionPhotos.length})</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {exceptionPhotos.map((photo: Photo) => (
                      <div 
                        key={photo.id} 
                        className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative group border-2 border-red-200"
                      >
                        <img
                          src={photo.filePath}
                          alt={photo.caption || '异常照片'}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => setSelectedPhoto(photo.filePath)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-sm bg-black/50 px-2 py-1 rounded">查看大图</span>
                        </div>
                        <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
                          <p className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate max-w-[70%]">
                            {photo.caption || '异常照片'}
                          </p>
                          <button
                            onClick={() => setShowDeleteConfirm(showDeleteConfirm === photo.id ? null : photo.id)}
                            className="p-1 text-white bg-black/50 rounded hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {showDeleteConfirm === photo.id && (
                          <div className="absolute inset-x-0 bottom-0 bg-black/80 p-2 rounded-b-lg">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="text-red-400 text-xs px-2 py-1 hover:text-red-300"
                              >
                                确认删除
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="text-white text-xs px-2 py-1 hover:text-gray-300"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {taskPhotos.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-400">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无照片</p>
                </div>
              )}
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

      {handleException && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">处理异常</h3>
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-700">{handleException.type}</p>
              <p className="text-sm text-gray-600 mt-1">{handleException.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">处理人</label>
                <input
                  type="text"
                  value={handleForm.handledBy}
                  onChange={(e) => setHandleForm(prev => ({ ...prev, handledBy: e.target.value }))}
                  placeholder="请输入处理人姓名"
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">处理结果</label>
                <textarea
                  value={handleForm.handledResult}
                  onChange={(e) => setHandleForm(prev => ({ ...prev, handledResult: e.target.value }))}
                  placeholder="请描述处理结果..."
                  rows={3}
                  className="form-input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setHandleException(null)}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button onClick={handleUpdateException} className="btn-primary">
                  确认处理
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedPhoto}
            alt="大图查看"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}