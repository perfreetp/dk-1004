import { useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Plus, MapPin, Trash2, Edit2, Eye, AlertTriangle, Navigation } from 'lucide-react';
import type { Route, Waypoint, RiskPoint } from '@/types';

export function RouteManagement() {
  const { routes, addRoute, updateRoute, deleteRoute } = useTaskStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [viewingRoute, setViewingRoute] = useState<Route | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    waypoints: [] as Waypoint[],
  });

  const calculateDistance = (waypoints: Waypoint[]): number => {
    let totalDistance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];
      const dx = p2.lat - p1.lat;
      const dy = p2.lng - p1.lng;
      totalDistance += Math.sqrt(dx * dx + dy * dy) * 111;
    }
    return Math.round(totalDistance * 10) / 10;
  };

  const calculateTime = (distance: number): number => {
    const avgSpeed = 50;
    return Math.round(distance / avgSpeed * 60);
  };

  const checkRiskPoints = (waypoints: Waypoint[]): RiskPoint[] => {
    const riskPoints: RiskPoint[] = [];
    const noFlyZones = [
      { lat: 31.2030, lng: 121.5050, type: '禁飞区', description: '附近有机场' },
      { lat: 31.2350, lng: 121.4800, type: '限高区', description: '高度限制100米' },
    ];

    waypoints.forEach((wp) => {
      noFlyZones.forEach((zone) => {
        const distance = Math.sqrt(Math.pow(wp.lat - zone.lat, 2) + Math.pow(wp.lng - zone.lng, 2));
        if (distance < 0.01) {
          riskPoints.push({ ...zone });
        }
      });
    });

    return riskPoints;
  };

  const handleAddWaypoint = () => {
    setFormData((prev) => ({
      ...prev,
      waypoints: [
        ...prev.waypoints,
        { lat: 31.2304, lng: 121.4737, name: `途经点${prev.waypoints.length + 1}` },
      ],
    }));
  };

  const handleUpdateWaypoint = (index: number, field: keyof Waypoint, value: number | string) => {
    setFormData((prev) => ({
      ...prev,
      waypoints: prev.waypoints.map((wp, i) =>
        i === index ? { ...wp, [field]: value } : wp
      ),
    }));
  };

  const handleRemoveWaypoint = (index: number) => {
    if (formData.waypoints.length <= 2) return;
    setFormData((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.waypoints.length < 2) return;

    const distance = calculateDistance(formData.waypoints);
    const time = calculateTime(distance);
    const risks = checkRiskPoints(formData.waypoints);

    if (editingRoute) {
      updateRoute(editingRoute.id, {
        name: formData.name,
        waypoints: formData.waypoints,
        totalDistance: distance,
        estimatedTime: time,
        riskPoints: risks,
      });
    } else {
      addRoute({
        name: formData.name,
        waypoints: formData.waypoints,
        totalDistance: distance,
        estimatedTime: time,
        riskPoints: risks,
      });
    }

    setShowCreateModal(false);
    setEditingRoute(null);
    setFormData({ name: '', waypoints: [] });
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({ name: route.name, waypoints: route.waypoints });
    setShowCreateModal(true);
  };

  const handleView = (route: Route) => {
    setViewingRoute(route);
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这条航线吗？')) {
      deleteRoute(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">航线管理</h2>
          <p className="text-gray-500 mt-1">管理无人机飞行航线</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建航线
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {routes.map((route) => (
          <div key={route.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{route.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {route.waypoints.length} 个途经点
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleView(route)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="查看详情"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(route)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(route.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                <span>{route.totalDistance} km</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{route.estimatedTime} min</span>
              </div>
            </div>

            {route.riskPoints.length > 0 && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{route.riskPoints.length} 个风险点</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingRoute ? '编辑航线' : '新建航线'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label">航线名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入航线名称"
                  className="form-input"
                />
              </div>

              <div className="mb-4">
                <label className="form-label">途经点</label>
                <div className="space-y-3">
                  {formData.waypoints.length === 0 && (
                    <button
                      type="button"
                      onClick={handleAddWaypoint}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-600 transition-colors"
                    >
                      点击添加途经点
                    </button>
                  )}
                  {formData.waypoints.map((wp, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={wp.name}
                          onChange={(e) => handleUpdateWaypoint(index, 'name', e.target.value)}
                          placeholder="名称"
                          className="form-input text-sm"
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={wp.lat}
                          onChange={(e) => handleUpdateWaypoint(index, 'lat', parseFloat(e.target.value) || 0)}
                          placeholder="纬度"
                          className="form-input text-sm"
                        />
                        <input
                          type="number"
                          step="0.0001"
                          value={wp.lng}
                          onChange={(e) => handleUpdateWaypoint(index, 'lng', parseFloat(e.target.value) || 0)}
                          placeholder="经度"
                          className="form-input text-sm"
                        />
                      </div>
                      {formData.waypoints.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWaypoint(index)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {formData.waypoints.length >= 1 && (
                  <button
                    type="button"
                    onClick={handleAddWaypoint}
                    className="mt-3 flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                    添加途经点
                  </button>
                )}
              </div>

              {formData.waypoints.length >= 2 && (
                <div className="card mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">航线信息</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">总里程:</span>
                      <span className="ml-2 font-semibold">{calculateDistance(formData.waypoints)} km</span>
                    </div>
                    <div>
                      <span className="text-gray-500">预计时间:</span>
                      <span className="ml-2 font-semibold">{calculateTime(calculateDistance(formData.waypoints))} min</span>
                    </div>
                  </div>
                  {checkRiskPoints(formData.waypoints).length > 0 && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">风险提示</span>
                      </div>
                      <ul className="mt-2 text-sm text-red-500">
                        {checkRiskPoints(formData.waypoints).map((risk, i) => (
                          <li key={i}>- {risk.type}: {risk.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRoute(null);
                    setFormData({ name: '', waypoints: [] });
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  {editingRoute ? '保存修改' : '创建航线'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{viewingRoute.name}</h3>

            <div className="space-y-4">
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">航线概览</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">总里程:</span>
                    <span className="ml-2 font-semibold">{viewingRoute.totalDistance} km</span>
                  </div>
                  <div>
                    <span className="text-gray-500">预计时间:</span>
                    <span className="ml-2 font-semibold">{viewingRoute.estimatedTime} min</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h4 className="font-medium text-gray-900 mb-3">途经点</h4>
                <div className="space-y-2">
                  {viewingRoute.waypoints.map((wp, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{wp.name}</span>
                        <p className="text-xs text-gray-500">{wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</p>
                      </div>
                      {index < viewingRoute.waypoints.length - 1 && (
                        <Navigation className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {viewingRoute.riskPoints.length > 0 && (
                <div className="card bg-red-50 border-red-100">
                  <div className="flex items-center gap-2 text-red-600 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">风险提示</span>
                  </div>
                  <ul className="space-y-2">
                    {viewingRoute.riskPoints.map((risk, i) => (
                      <li key={i} className="text-sm text-red-500">
                        <span className="font-medium">{risk.type}:</span> {risk.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewingRoute(null)}
              className="mt-4 w-full btn-secondary"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
