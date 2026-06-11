import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Route, Resource, Exception, Photo } from '@/types';

interface TaskStore {
  tasks: Task[];
  routes: Route[];
  resources: Resource[];
  exceptions: Exception[];
  photos: Photo[];
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; conflicts?: string[] };
  updateTask: (id: number, updates: Partial<Task>) => { success: boolean; conflicts?: string[] };
  deleteTask: (id: number) => void;
  getTaskById: (id: number) => Task | undefined;
  
  addRoute: (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoute: (id: number, updates: Partial<Route>) => void;
  deleteRoute: (id: number) => void;
  getRouteById: (id: number) => Route | undefined;
  getRoutes: () => Route[];
  
  addException: (exception: Omit<Exception, 'id' | 'createdAt'>) => void;
  updateException: (id: number, updates: Partial<Pick<Exception, 'handledBy' | 'handledResult'>>) => void;
  addPhoto: (photo: Omit<Photo, 'id' | 'uploadedAt'>) => void;
  getPhotosByTaskId: (taskId: number) => Photo[];
  getPhotosByCategory: (taskId: number, category: 'normal' | 'exception') => Photo[];
  deletePhoto: (photoId: number) => void;
  
  getTasksByStatus: (status: Task['status']) => Task[];
  getPilots: () => Resource[];
  getEquipments: () => Resource[];
  getBatteries: () => Resource[];
  
  checkResourceConflict: (resourceType: 'pilot' | 'equipment' | 'battery', resourceId: number, dateTime: string, excludeTaskId?: number) => Task | null;
  getResourceBookings: (resourceId: number, resourceType: 'pilot' | 'equipment' | 'battery') => Task[];
  getTasksByDate: (date: string) => Task[];
  getDelayReasons: () => { reason: string; count: number }[];
  
  getResourceUtilization: () => { type: string; name: string; utilization: number; totalTasks: number }[];
  getExceptionStats: () => { total: number; handled: number; unhandled: number };
  getOnTimeRate: () => number;
}

const initialTasks: Task[] = [
  {
    id: 1,
    name: '工业园区巡检',
    location: '上海市浦东新区张江高科技园区',
    dateTime: '2024-01-15T09:00:00',
    aircraftModel: 'DJI Mavic 3',
    payloadType: '巡检',
    pilotId: 1,
    equipmentId: 4,
    batteryId: 7,
    routeId: 1,
    priority: 'high',
    status: 'pending',
    createdAt: '2024-01-10T10:00:00',
    updatedAt: '2024-01-10T10:00:00',
  },
  {
    id: 2,
    name: '农田监测',
    location: '江苏省苏州市相城区',
    dateTime: '2024-01-15T14:00:00',
    aircraftModel: 'DJI Phantom 4 RTK',
    payloadType: '拍摄',
    pilotId: 2,
    equipmentId: 5,
    batteryId: 8,
    routeId: 2,
    priority: 'medium',
    status: 'active',
    takeoffTime: '2024-01-15T14:05:00',
    createdAt: '2024-01-12T08:00:00',
    updatedAt: '2024-01-15T14:05:00',
  },
  {
    id: 3,
    name: '物流配送测试',
    location: '杭州市余杭区菜鸟物流园',
    dateTime: '2024-01-14T10:00:00',
    aircraftModel: 'DJI Matrice 300',
    payloadType: '物资投送',
    pilotId: 3,
    equipmentId: 6,
    batteryId: 9,
    routeId: 1,
    priority: 'high',
    status: 'completed',
    takeoffTime: '2024-01-14T10:05:00',
    landingTime: '2024-01-14T10:35:00',
    createdAt: '2024-01-11T15:00:00',
    updatedAt: '2024-01-14T10:35:00',
  },
  {
    id: 4,
    name: '城市绿化巡检',
    location: '南京市玄武区',
    dateTime: '2024-01-16T08:30:00',
    aircraftModel: 'DJI Mini 3 Pro',
    payloadType: '巡检',
    pilotId: 1,
    equipmentId: 4,
    batteryId: 10,
    routeId: 2,
    priority: 'low',
    status: 'pending',
    createdAt: '2024-01-13T11:00:00',
    updatedAt: '2024-01-13T11:00:00',
  },
  {
    id: 5,
    name: '电力线路巡检',
    location: '安徽省合肥市高新区',
    dateTime: '2024-01-15T11:00:00',
    aircraftModel: 'DJI Inspire 3',
    payloadType: '巡检',
    pilotId: 2,
    equipmentId: 5,
    batteryId: 8,
    routeId: 1,
    priority: 'high',
    status: 'active',
    takeoffTime: '2024-01-15T11:08:00',
    createdAt: '2024-01-14T09:00:00',
    updatedAt: '2024-01-15T11:08:00',
  },
];

const initialRoutes: Route[] = [
  {
    id: 1,
    name: '工业园区巡检路线',
    waypoints: [
      { lat: 31.2304, lng: 121.4737, name: '起点' },
      { lat: 31.2350, lng: 121.4800, name: '途经点1' },
      { lat: 31.2400, lng: 121.4850, name: '途经点2' },
      { lat: 31.2380, lng: 121.4900, name: '终点' },
    ],
    totalDistance: 5.2,
    estimatedTime: 15,
    riskPoints: [],
    createdAt: '2024-01-01T08:00:00',
    updatedAt: '2024-01-01T08:00:00',
  },
  {
    id: 2,
    name: '农田监测路线',
    waypoints: [
      { lat: 31.2000, lng: 121.5000, name: '起点' },
      { lat: 31.2050, lng: 121.5100, name: '途经点1' },
      { lat: 31.2100, lng: 121.5050, name: '终点' },
    ],
    totalDistance: 3.8,
    estimatedTime: 10,
    riskPoints: [
      { lat: 31.2030, lng: 121.5050, type: '禁飞区', description: '附近有机场' },
    ],
    createdAt: '2024-01-02T09:00:00',
    updatedAt: '2024-01-05T10:00:00',
  },
];

const initialResources: Resource[] = [
  { id: 1, name: '张飞行员', type: 'pilot', status: 'available', createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-01T08:00:00' },
  { id: 2, name: '李飞行员', type: 'pilot', status: 'available', createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-01T08:00:00' },
  { id: 3, name: '王飞行员', type: 'pilot', status: 'unavailable', createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-15T10:00:00' },
  { id: 4, name: '无人机-A001', type: 'equipment', status: 'available', batteryLevel: 85, lastMaintenance: '2024-01-10', createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-10T08:00:00' },
  { id: 5, name: '无人机-A002', type: 'equipment', status: 'active', batteryLevel: 45, lastMaintenance: '2024-01-05', createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-15T10:00:00' },
  { id: 6, name: '无人机-A003', type: 'equipment', status: 'available', batteryLevel: 90, lastMaintenance: '2024-01-12', createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-12T08:00:00' },
  { id: 7, name: '电池-B001', type: 'battery', status: 'available', batteryLevel: 100, createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-01T08:00:00' },
  { id: 8, name: '电池-B002', type: 'battery', status: 'active', batteryLevel: 60, createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-15T10:00:00' },
  { id: 9, name: '电池-B003', type: 'battery', status: 'available', batteryLevel: 95, createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-01T08:00:00' },
  { id: 10, name: '电池-B004', type: 'battery', status: 'available', batteryLevel: 80, createdAt: '2024-01-01T08:00:00', updatedAt: '2024-01-01T08:00:00' },
];

const initialExceptions: Exception[] = [
  {
    id: 1,
    taskId: 2,
    type: '天气异常',
    description: '遇到强风，飞行高度受限',
    occurredAt: '2024-01-15T14:20:00',
    handled: true,
    createdAt: '2024-01-15T14:20:00',
  },
];

const initialPhotos: Photo[] = [
  {
    id: 1,
    taskId: 3,
    filePath: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=drone%20delivery%20logistics%20warehouse%20aerial%20view&image_size=landscape_16_9',
    caption: '配送现场照片',
    uploadedAt: '2024-01-14T10:30:00',
    category: 'normal',
  },
];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      routes: initialRoutes,
      resources: initialResources,
      exceptions: initialExceptions,
      photos: initialPhotos,

      addTask: (task) => {
        const conflicts: string[] = [];
        
        const pilotConflict = get().checkResourceConflict('pilot', task.pilotId, task.dateTime);
        if (pilotConflict) {
          conflicts.push(`飞手 "${get().getPilots().find(p => p.id === task.pilotId)?.name}" 在该时间已被任务 "${pilotConflict.name}" 占用`);
        }
        
        const equipmentConflict = get().checkResourceConflict('equipment', task.equipmentId, task.dateTime);
        if (equipmentConflict) {
          conflicts.push(`设备 "${get().getEquipments().find(e => e.id === task.equipmentId)?.name}" 在该时间已被任务 "${equipmentConflict.name}" 占用`);
        }
        
        const batteryConflict = get().checkResourceConflict('battery', task.batteryId, task.dateTime);
        if (batteryConflict) {
          conflicts.push(`电池 "${get().getBatteries().find(b => b.id === task.batteryId)?.name}" 在该时间已被任务 "${batteryConflict.name}" 占用`);
        }
        
        if (conflicts.length > 0) {
          return { success: false, conflicts };
        }
        
        set((state) => ({
          tasks: [...state.tasks, {
            ...task,
            id: Math.max(...state.tasks.map(t => t.id), 0) + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }],
        }));
        
        return { success: true };
      },

      updateTask: (id, updates) => {
        const existingTask = get().getTaskById(id);
        if (!existingTask) return { success: false, conflicts: ['任务不存在'] };
        
        const conflicts: string[] = [];
        const taskDateTime = updates.dateTime || existingTask.dateTime;
        
        if ('pilotId' in updates && updates.pilotId !== undefined && updates.pilotId !== existingTask.pilotId) {
          const pilotConflict = get().checkResourceConflict('pilot', updates.pilotId, taskDateTime, id);
          if (pilotConflict) {
            conflicts.push(`飞手 "${get().getPilots().find(p => p.id === updates.pilotId)?.name}" 在该时间已被任务 "${pilotConflict.name}" 占用`);
          }
        }
        
        if ('equipmentId' in updates && updates.equipmentId !== undefined && updates.equipmentId !== existingTask.equipmentId) {
          const equipmentConflict = get().checkResourceConflict('equipment', updates.equipmentId, taskDateTime, id);
          if (equipmentConflict) {
            conflicts.push(`设备 "${get().getEquipments().find(e => e.id === updates.equipmentId)?.name}" 在该时间已被任务 "${equipmentConflict.name}" 占用`);
          }
        }
        
        if ('batteryId' in updates && updates.batteryId !== undefined && updates.batteryId !== existingTask.batteryId) {
          const batteryConflict = get().checkResourceConflict('battery', updates.batteryId, taskDateTime, id);
          if (batteryConflict) {
            conflicts.push(`电池 "${get().getBatteries().find(b => b.id === updates.batteryId)?.name}" 在该时间已被任务 "${batteryConflict.name}" 占用`);
          }
        }
        
        if (conflicts.length > 0) {
          return { success: false, conflicts };
        }
        
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
          ),
        }));
        
        return { success: true };
      },

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        exceptions: state.exceptions.filter((ex) => ex.taskId !== id),
        photos: state.photos.filter((p) => p.taskId !== id),
      })),

      getTaskById: (id) => get().tasks.find((task) => task.id === id),

      addRoute: (route) => set((state) => ({
        routes: [...state.routes, {
          ...route,
          id: Math.max(...state.routes.map(r => r.id), 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),

      updateRoute: (id, updates) => set((state) => ({
        routes: state.routes.map((route) =>
          route.id === id ? { ...route, ...updates, updatedAt: new Date().toISOString() } : route
        ),
      })),

      deleteRoute: (id) => set((state) => ({
        routes: state.routes.filter((route) => route.id !== id),
      })),

      getRouteById: (id) => get().routes.find((route) => route.id === id),

      getRoutes: () => get().routes,

      addException: (exception) => set((state) => ({
        exceptions: [...state.exceptions, {
          ...exception,
          id: Math.max(...state.exceptions.map(e => e.id), 0) + 1,
          createdAt: new Date().toISOString(),
        }],
      })),

      updateException: (id, updates) => set((state) => ({
        exceptions: state.exceptions.map((ex) =>
          ex.id === id ? { ...ex, ...updates, handled: true, handledAt: new Date().toISOString() } : ex
        ),
      })),

      addPhoto: (photo) => set((state) => ({
        photos: [...state.photos, {
          ...photo,
          id: Math.max(...state.photos.map(p => p.id), 0) + 1,
          uploadedAt: new Date().toISOString(),
          category: photo.category || 'normal',
        }],
      })),

      getPhotosByTaskId: (taskId) => get().photos.filter((photo) => photo.taskId === taskId),
      
      getPhotosByCategory: (taskId, category: 'normal' | 'exception') => 
        get().photos.filter((photo) => photo.taskId === taskId && photo.category === category),

      deletePhoto: (photoId) => set((state) => ({
        photos: state.photos.filter((photo) => photo.id !== photoId),
      })),

      getTasksByStatus: (status) => get().tasks.filter((task) => task.status === status),

      getPilots: () => get().resources.filter((r) => r.type === 'pilot'),

      getEquipments: () => get().resources.filter((r) => r.type === 'equipment'),

      getBatteries: () => get().resources.filter((r) => r.type === 'battery'),

      checkResourceConflict: (resourceType, resourceId, dateTime, excludeTaskId) => {
        const newTaskStart = new Date(dateTime).getTime();
        const newTaskDuration = 60 * 60 * 1000;
        const newTaskEnd = newTaskStart + newTaskDuration;
        
        const conflictingTask = get().tasks.find((task) => {
          if (task.id === excludeTaskId) return false;
          if (task.status === 'completed') return false;
          
          const existingTaskStart = new Date(task.dateTime).getTime();
          const existingTaskDuration = 60 * 60 * 1000;
          const existingTaskEnd = existingTaskStart + existingTaskDuration;
          
          const hasOverlap = newTaskStart < existingTaskEnd && newTaskEnd > existingTaskStart;
          
          if (resourceType === 'pilot' && task.pilotId === resourceId && hasOverlap) {
            return true;
          }
          if (resourceType === 'equipment' && task.equipmentId === resourceId && hasOverlap) {
            return true;
          }
          if (resourceType === 'battery' && task.batteryId === resourceId && hasOverlap) {
            return true;
          }
          
          return false;
        });
        
        return conflictingTask || null;
      },

      getResourceBookings: (resourceId, resourceType) => {
        return get().tasks.filter((task) => {
          if (resourceType === 'pilot') return task.pilotId === resourceId;
          if (resourceType === 'equipment') return task.equipmentId === resourceId;
          if (resourceType === 'battery') return task.batteryId === resourceId;
          return false;
        });
      },

      getTasksByDate: (date) => {
        return get().tasks.filter((task) => {
          const taskDate = new Date(task.dateTime).toLocaleDateString('zh-CN');
          return taskDate === date;
        });
      },

      getDelayReasons: () => {
        const exceptions = get().exceptions;
        const reasonCounts: Record<string, number> = {};
        
        exceptions.forEach((ex) => {
          reasonCounts[ex.type] = (reasonCounts[ex.type] || 0) + 1;
        });

        const delayedTasks = get().tasks.filter((t) => {
          if (t.status !== 'completed') return false;
          const plannedTime = new Date(t.dateTime).getTime();
          const actualTime = new Date(t.landingTime || t.dateTime).getTime();
          return actualTime > plannedTime + 30 * 60 * 1000;
        });
        
        delayedTasks.forEach(() => {
          reasonCounts['任务延误'] = (reasonCounts['任务延误'] || 0) + 1;
        });

        return Object.entries(reasonCounts).map(([reason, count]) => ({ reason, count }));
      },

      getResourceUtilization: () => {
        const allResources = get().resources;
        const tasks = get().tasks;
        
        return allResources.map((resource) => {
          const resourceTasks = tasks.filter((task) => {
            if (resource.type === 'pilot') return task.pilotId === resource.id;
            if (resource.type === 'equipment') return task.equipmentId === resource.id;
            if (resource.type === 'battery') return task.batteryId === resource.id;
            return false;
          });
          
          const totalDays = 30;
          const usedDays = new Set(resourceTasks.map(t => new Date(t.dateTime).toDateString())).size;
          const utilization = Math.round((usedDays / totalDays) * 100);
          
          return {
            type: resource.type,
            name: resource.name,
            utilization,
            totalTasks: resourceTasks.length,
          };
        });
      },

      getExceptionStats: () => {
        const exceptions = get().exceptions;
        const handled = exceptions.filter((ex) => ex.handled).length;
        return {
          total: exceptions.length,
          handled,
          unhandled: exceptions.length - handled,
        };
      },

      getOnTimeRate: () => {
        const completedTasks = get().tasks.filter((t) => t.status === 'completed' && t.landingTime);
        if (completedTasks.length === 0) return 0;
        
        const onTimeCount = completedTasks.filter((t) => {
          const plannedTime = new Date(t.dateTime).getTime();
          const actualTime = new Date(t.landingTime!).getTime();
          return actualTime <= plannedTime + 30 * 60 * 1000;
        }).length;
        
        return Math.round((onTimeCount / completedTasks.length) * 100);
      },
    }),
    {
      name: 'flight-task-scheduler-storage',
    }
  )
);
