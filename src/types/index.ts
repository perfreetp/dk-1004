export interface Task {
  id: number;
  name: string;
  location: string;
  dateTime: string;
  aircraftModel: string;
  payloadType: string;
  pilotId: number;
  equipmentId: number;
  batteryId: number;
  routeId: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'active' | 'completed';
  takeoffTime?: string;
  landingTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: number;
  name: string;
  waypoints: Waypoint[];
  totalDistance: number;
  estimatedTime: number;
  riskPoints: RiskPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface Waypoint {
  lat: number;
  lng: number;
  name: string;
}

export interface RiskPoint {
  lat: number;
  lng: number;
  type: string;
  description: string;
}

export interface Resource {
  id: number;
  name: string;
  type: 'pilot' | 'equipment' | 'battery';
  status: 'available' | 'unavailable' | 'active';
  batteryLevel?: number;
  lastMaintenance?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceBooking {
  id: number;
  resourceId: number;
  taskId: number;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface Exception {
  id: number;
  taskId: number;
  type: string;
  description: string;
  occurredAt: string;
  handled: boolean;
  createdAt: string;
}

export interface Photo {
  id: number;
  taskId: number;
  filePath: string;
  caption?: string;
  uploadedAt: string;
}

export interface Statistics {
  byType: { type: string; count: number }[];
  completionRate: number;
  delayReasons: { reason: string; count: number }[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  activeTasks: number;
}
