import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { ArrowLeft, Plane, MapPin, Calendar, User, Package, Battery, AlertCircle, AlertTriangle } from 'lucide-react';

interface NewTaskProps {
  onBack: () => void;
}

const aircraftModels = [
  'DJI Mavic 3',
  'DJI Phantom 4 RTK',
  'DJI Matrice 300',
  'DJI Inspire 3',
  'DJI Mini 3 Pro',
];

const payloadTypes = ['巡检', '拍摄', '物资投送', '测绘', '其他'];

const priorities = [
  { value: 'high', label: '高优先级', color: 'text-red-600' },
  { value: 'medium', label: '中优先级', color: 'text-yellow-600' },
  { value: 'low', label: '低优先级', color: 'text-gray-600' },
];

export function NewTask({ onBack }: NewTaskProps) {
  const { addTask, getPilots, getEquipments, getBatteries, getRoutes } = useTaskStore();
  const pilots = getPilots().filter((p) => p.status === 'available');
  const equipments = getEquipments().filter((e) => e.status === 'available');
  const batteries = getBatteries().filter((b) => b.status === 'available');
  const routes = getRoutes();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    dateTime: '',
    aircraftModel: '',
    payloadType: '',
    pilotId: '',
    equipmentId: '',
    batteryId: '',
    routeId: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictErrors, setConflictErrors] = useState<string[]>([]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入任务名称';
    if (!formData.location.trim()) newErrors.location = '请输入任务地点';
    if (!formData.dateTime) newErrors.dateTime = '请选择任务时间';
    if (!formData.aircraftModel) newErrors.aircraftModel = '请选择机型';
    if (!formData.payloadType) newErrors.payloadType = '请选择载荷类型';
    if (!formData.pilotId) newErrors.pilotId = '请指派飞行员';
    if (!formData.equipmentId) newErrors.equipmentId = '请选择无人机设备';
    if (!formData.batteryId) newErrors.batteryId = '请选择电池';
    if (!formData.routeId) newErrors.routeId = '请选择航线';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictErrors([]);
    
    if (!validate()) return;

    const result = addTask({
      name: formData.name,
      location: formData.location,
      dateTime: formData.dateTime,
      aircraftModel: formData.aircraftModel,
      payloadType: formData.payloadType,
      pilotId: parseInt(formData.pilotId),
      equipmentId: parseInt(formData.equipmentId),
      batteryId: parseInt(formData.batteryId),
      routeId: parseInt(formData.routeId),
      priority: formData.priority,
      status: 'pending',
      notes: formData.notes || undefined,
    });

    if (result.success) {
      onBack();
    } else {
      setConflictErrors(result.conflicts || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
    setConflictErrors([]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <h2 className="text-2xl font-bold text-gray-900">新建任务</h2>
      </div>

      {conflictErrors.length > 0 && (
        <div className="card bg-red-50 border-red-200 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">资源冲突提醒</p>
              <ul className="mt-2 space-y-1">
                {conflictErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">- {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">基本信息</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">任务名称</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入任务名称"
                className={`form-input ${errors.name ? 'border-red-300' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  任务地点
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="请输入任务地点"
                  className={`form-input ${errors.location ? 'border-red-300' : ''}`}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
              
              <div>
                <label className="form-label flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  任务时间
                </label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleChange}
                  className={`form-input ${errors.dateTime ? 'border-red-300' : ''}`}
                />
                {errors.dateTime && <p className="text-red-500 text-sm mt-1">{errors.dateTime}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">设备与载荷</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label flex items-center gap-1">
                <Plane className="w-4 h-4" />
                机型
              </label>
              <select
                name="aircraftModel"
                value={formData.aircraftModel}
                onChange={handleChange}
                className={`form-select ${errors.aircraftModel ? 'border-red-300' : ''}`}
              >
                <option value="">请选择机型</option>
                {aircraftModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              {errors.aircraftModel && <p className="text-red-500 text-sm mt-1">{errors.aircraftModel}</p>}
            </div>

            <div>
              <label className="form-label flex items-center gap-1">
                <Package className="w-4 h-4" />
                载荷类型
              </label>
              <select
                name="payloadType"
                value={formData.payloadType}
                onChange={handleChange}
                className={`form-select ${errors.payloadType ? 'border-red-300' : ''}`}
              >
                <option value="">请选择载荷类型</option>
                {payloadTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.payloadType && <p className="text-red-500 text-sm mt-1">{errors.payloadType}</p>}
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">资源分配</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label flex items-center gap-1">
                <User className="w-4 h-4" />
                指派飞行员
              </label>
              <select
                name="pilotId"
                value={formData.pilotId}
                onChange={handleChange}
                className={`form-select ${errors.pilotId ? 'border-red-300' : ''}`}
              >
                <option value="">请选择飞行员</option>
                {pilots.map((pilot) => (
                  <option key={pilot.id} value={pilot.id}>{pilot.name}</option>
                ))}
              </select>
              {errors.pilotId && <p className="text-red-500 text-sm mt-1">{errors.pilotId}</p>}
            </div>

            <div>
              <label className="form-label flex items-center gap-1">
                <Plane className="w-4 h-4" />
                无人机设备
              </label>
              <select
                name="equipmentId"
                value={formData.equipmentId}
                onChange={handleChange}
                className={`form-select ${errors.equipmentId ? 'border-red-300' : ''}`}
              >
                <option value="">请选择无人机</option>
                {equipments.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name} (电量: {equipment.batteryLevel}%)
                  </option>
                ))}
              </select>
              {errors.equipmentId && <p className="text-red-500 text-sm mt-1">{errors.equipmentId}</p>}
            </div>

            <div>
              <label className="form-label flex items-center gap-1">
                <Battery className="w-4 h-4" />
                电池
              </label>
              <select
                name="batteryId"
                value={formData.batteryId}
                onChange={handleChange}
                className={`form-select ${errors.batteryId ? 'border-red-300' : ''}`}
              >
                <option value="">请选择电池</option>
                {batteries.map((battery) => (
                  <option key={battery.id} value={battery.id}>
                    {battery.name} (电量: {battery.batteryLevel}%)
                  </option>
                ))}
              </select>
              {errors.batteryId && <p className="text-red-500 text-sm mt-1">{errors.batteryId}</p>}
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">航线与优先级</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">航线选择</label>
              <select
                name="routeId"
                value={formData.routeId}
                onChange={handleChange}
                className={`form-select ${errors.routeId ? 'border-red-300' : ''}`}
              >
                <option value="">请选择航线</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.totalDistance} km / {route.estimatedTime} min)
                  </option>
                ))}
              </select>
              {errors.routeId && <p className="text-red-500 text-sm mt-1">{errors.routeId}</p>}
            </div>

            <div>
              <label className="form-label flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                优先级
              </label>
              <div className="flex gap-4">
                {priorities.map((priority) => (
                  <label
                    key={priority.value}
                    className={`flex items-center gap-2 cursor-pointer ${
                      formData.priority === priority.value ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className={formData.priority === priority.value ? priority.color : ''}>
                      {priority.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">备注信息</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="请输入备注信息（可选）"
            rows={3}
            className="form-input resize-none"
          />
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={onBack} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            创建任务
          </button>
        </div>
      </form>
    </div>
  );
}
