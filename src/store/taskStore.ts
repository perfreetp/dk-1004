import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Route, Resource, Exception, Photo } from '@/types';

interface TaskStore {
  tasks: Task[];
  routes: Route[];
  resources: Resource[];
  exceptions: Exception[];
  photos: Photo[];
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: number, updates: Partial<Task>) => void;
  deleteTask: (id: number) => void;
  getTaskById: (id: number) => Task | undefined;
  
  addRoute: (route: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoute: (id: number, updates: Partial<Route>) => void;
  deleteRoute: (id: number) => void;
  getRouteById: (id: number) => Route | undefined;
  getRoutes: () => Route[];
  
  addException: (exception: Omit<Exception, 'id' | 'createdAt'>) => void;
  addPhoto: (photo: Omit<Photo, 'id' | 'uploadedAt'>) => void;
  getPhotosByTaskId: (taskId: number) => Photo[];
  
  getTasksByStatus: (status: Task['status']) => Task[];
  getPilots: () => Resource[];
  getEquipments: () => Resource[];
  getBatteries: () => Resource[];
  
  getResourceBookings: (resourceId: number) => Task[];
  getTasksByDate: (date: string) => Task[];
  getDelayReasons: () => { reason: string; count: number }[];
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

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, {
          ...task,
          id: Math.max(...state.tasks.map(t => t.id), 0) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        ),
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
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

      addPhoto: (photo) => set((state) => ({
        photos: [...state.photos, {
          ...photo,
          id: Math.max(...state.photos.map(p => p.id), 0) + 1,
          uploadedAt: new Date().toISOString(),
        }],
      })),

      getPhotosByTaskId: (taskId) => get().photos.filter((photo) => photo.taskId === taskId),

      getTasksByStatus: (status) => get().tasks.filter((task) => task.status === status),

      getPilots: () => get().resources.filter((r) => r.type === 'pilot'),

      getEquipments: () => get().resources.filter((r) => r.type === 'equipment'),

      getBatteries: () => get().resources.filter((r) => r.type === 'battery'),

      getResourceBookings: (resourceId) => {
        const pilots = get().getPilots();
        const pilot = pilots.find(p => p.id === resourceId);
        if (pilot) {
          return get().tasks.filter(t => t.pilotId === resourceId);
        }
        return [];
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
    }),
    {
      name: 'flight-task-scheduler-storage',
    }
  )
);
