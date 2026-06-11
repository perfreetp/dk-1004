import { useTaskStore } from '@/store/taskStore';
import { Download, TrendingUp, Calendar, Users, Battery, Cpu, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function Statistics() {
  const { tasks, getDelayReasons, getPilots, getResourceUtilization, getExceptionStats, getOnTimeRate } = useTaskStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const activeTasks = tasks.filter((t) => t.status === 'active').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const resourceUtilization = getResourceUtilization();
  const exceptionStats = getExceptionStats();
  const onTimeRate = getOnTimeRate();

  const tasksByType = tasks.reduce((acc, task) => {
    acc[task.payloadType] = (acc[task.payloadType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const delayReasons = getDelayReasons();

  const pilots = getPilots();
  const topPilots = pilots.map((pilot) => {
    const pilotTasks = tasks.filter((t) => t.pilotId === pilot.id);
    const completed = pilotTasks.filter((t) => t.status === 'completed').length;
    const completion = pilotTasks.length > 0 ? Math.round((completed / pilotTasks.length) * 100) : 0;
    return {
      name: pilot.name,
      tasks: pilotTasks.length,
      completion,
    };
  }).sort((a, b) => b.tasks - a.tasks).slice(0, 3);

  const handleExport = () => {
    const { getEquipments, getBatteries, exceptions, getPhotosByTaskId } = useTaskStore.getState();
    const equipments = getEquipments();
    const batteries = getBatteries();
    
    const headers = [
      '任务ID', '任务名称', '地点', '时间', '机型', '载荷类型', '飞行员', '设备', '电池', 
      '状态', '起飞时间', '返航时间', '异常数量', '已处理异常', '未处理异常',
      '照片数量', '普通照片', '异常照片', '异常详情', '照片清单'
    ];
    const rows = tasks.map((task) => {
      const pilot = pilots.find((p) => p.id === task.pilotId);
      const equipment = equipments.find((e) => e.id === task.equipmentId);
      const battery = batteries.find((b) => b.id === task.batteryId);
      const taskExceptions = exceptions.filter((e) => e.taskId === task.id);
      const taskPhotos = getPhotosByTaskId(task.id);
      const handledExceptions = taskExceptions.filter(e => e.handled);
      const normalPhotos = taskPhotos.filter(p => p.category === 'normal');
      const exceptionPhotos = taskPhotos.filter(p => p.category === 'exception');
      
      const exceptionDetails = taskExceptions.map(e => 
        `${e.type}(${e.handled ? '已处理' : '待处理'}): ${e.description}${e.handled && e.handledBy ? ` [处理人: ${e.handledBy}]` : ''}`
      ).join('; ');
      
      const photoList = taskPhotos.map(p => 
        `${p.caption || '无标题'}(${p.category === 'normal' ? '普通' : '异常'})`
      ).join('; ');
      
      return [
        task.id,
        `"${task.name}"`,
        `"${task.location}"`,
        new Date(task.dateTime).toLocaleString('zh-CN'),
        task.aircraftModel,
        task.payloadType,
        pilot?.name || '未指派',
        equipment?.name || '未分配',
        battery?.name || '未分配',
        task.status === 'pending' ? '待派发' : task.status === 'active' ? '执行中' : '已完成',
        task.takeoffTime ? new Date(task.takeoffTime).toLocaleString('zh-CN') : '-',
        task.landingTime ? new Date(task.landingTime).toLocaleString('zh-CN') : '-',
        taskExceptions.length,
        handledExceptions.length,
        taskExceptions.length - handledExceptions.length,
        taskPhotos.length,
        normalPhotos.length,
        exceptionPhotos.length,
        `"${exceptionDetails}"`,
        `"${photoList}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `任务单_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMaxValue = (data: number[]) => Math.max(...data, 1);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">统计报表</h2>
          <p className="text-gray-500 mt-1">查看任务统计和数据分析</p>
        </div>
        <button
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出任务单
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">总任务数</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">完成率</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">准点率</p>
              <p className="text-2xl font-bold text-gray-900">{onTimeRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">未处理异常</p>
              <p className="text-2xl font-bold text-gray-900">{exceptionStats.unhandled}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">任务类型分布</h3>
          <div className="space-y-4">
            {Object.entries(tasksByType).map(([type, count]) => {
              const percentage = Math.round((count / totalTasks) * 100);
              return (
                <div key={type}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">{type}</span>
                    <span className="text-gray-500">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">延误原因分析</h3>
          <div className="space-y-4">
            {delayReasons.length > 0 ? (
              delayReasons.map((item) => {
                const maxCount = getMaxValue(delayReasons.map((r) => r.count));
                const percentage = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.reason}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.reason}</span>
                      <span className="text-sm text-gray-500">{item.count}次</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">暂无延误数据</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-3 card">
          <h3 className="font-semibold text-gray-900 mb-4">飞手绩效排名</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">排名</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">飞手</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">完成任务数</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">完成率</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {topPilots.map((pilot, index) => (
                  <tr key={pilot.name} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">{pilot.name}</td>
                    <td className="py-3 px-4 text-gray-600">{pilot.tasks} 次</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${pilot.completion}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{pilot.completion}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        正常
                      </span>
                    </td>
                  </tr>
                ))}
                {topPilots.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      暂无飞手数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">资源利用率</h3>
          <div className="space-y-4">
            {resourceUtilization.length > 0 ? (
              resourceUtilization.map((resource) => {
                const IconComponent = resource.type === 'pilot' ? Users : resource.type === 'equipment' ? Cpu : Battery;
                const typeLabel = resource.type === 'pilot' ? '飞手' : resource.type === 'equipment' ? '设备' : '电池';
                return (
                  <div key={`${resource.type}-${resource.name}`} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{resource.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{typeLabel}</span>
                        </div>
                        <span className="text-sm text-gray-500">{resource.totalTasks} 任务</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full transition-all duration-500"
                          style={{ width: `${resource.utilization}%` }}
                        />
                      </div>
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-gray-500">{resource.utilization}%</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">暂无资源数据</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">异常处理状态</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-gray-700">待处理</span>
              </div>
              <span className="text-xl font-bold text-red-600">{exceptionStats.unhandled}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">已处理</span>
              </div>
              <span className="text-xl font-bold text-green-600">{exceptionStats.handled}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">处理率</span>
                <span className="text-sm font-medium text-gray-900">
                  {exceptionStats.total > 0 ? Math.round((exceptionStats.handled / exceptionStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${exceptionStats.total > 0 ? (exceptionStats.handled / exceptionStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-3 card">
          <h3 className="font-semibold text-gray-900 mb-4">任务状态统计</h3>
          <div className="flex justify-around">
            <div className="text-center">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-yellow-600">{pendingTasks}</span>
              </div>
              <p className="text-sm text-gray-600">待派发</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-blue-600">{activeTasks}</span>
              </div>
              <p className="text-sm text-gray-600">执行中</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-green-600">{completedTasks}</span>
              </div>
              <p className="text-sm text-gray-600">已完成</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
