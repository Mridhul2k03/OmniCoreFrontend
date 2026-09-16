import { apiClient } from './client';
import { ShuttleRoute, ShuttleSchedule, ShuttlePassenger } from '../types';
import { MOCK_SHUTTLE_ROUTES, MOCK_SHUTTLE_SCHEDULES, MOCK_SHUTTLE_PASSENGERS } from './mockData';

let routesState = [...MOCK_SHUTTLE_ROUTES];
let schedulesState = [...MOCK_SHUTTLE_SCHEDULES];
let passengersState = [...MOCK_SHUTTLE_PASSENGERS];

export const shuttleApi = {
  getRoutes: async (): Promise<ShuttleRoute[]> => {
    try {
      const response = await apiClient.get('/api/v1/shuttle/routes/');
      return response.data;
    } catch {
      return routesState;
    }
  },

  getRouteById: async (id: string): Promise<ShuttleRoute | null> => {
    try {
      const response = await apiClient.get(`/api/v1/shuttle/routes/${id}/`);
      return response.data;
    } catch {
      return routesState.find((r) => r.id === id) || null;
    }
  },

  createRoute: async (data: Partial<ShuttleRoute>): Promise<ShuttleRoute> => {
    try {
      const response = await apiClient.post('/api/v1/shuttle/routes/', data);
      return response.data;
    } catch {
      const newRoute: ShuttleRoute = {
        id: `route_sh_${Date.now()}`,
        routeCode: `S-RT-${Math.floor(100 + Math.random() * 900)}`,
        name: data.name || 'New Shuttle Route',
        organizationType: data.organizationType || 'corporate_it',
        stops: data.stops || [],
        destinationCampus: data.destinationCampus || 'Main Campus Terminal',
        totalDistanceKm: data.totalDistanceKm || 20,
        estimatedDurationMins: data.estimatedDurationMins || 35,
        assignedBusNumber: data.assignedBusNumber || 'BUS-SH-099',
        assignedDriverName: data.assignedDriverName || 'Assigned Driver',
        status: 'active',
        ...data,
      };
      routesState = [...routesState, newRoute];
      return newRoute;
    }
  },

  getSchedules: async (): Promise<ShuttleSchedule[]> => {
    try {
      const response = await apiClient.get('/api/v1/shuttle/schedules/');
      return response.data;
    } catch {
      return schedulesState;
    }
  },

  createSchedule: async (data: Partial<ShuttleSchedule>): Promise<ShuttleSchedule> => {
    try {
      const response = await apiClient.post('/api/v1/shuttle/schedules/', data);
      return response.data;
    } catch {
      const newSchedule: ShuttleSchedule = {
        id: `sch_${Date.now()}`,
        routeId: data.routeId || 'route_sh_01',
        routeName: data.routeName || 'Tech District Corporate Campus Express',
        shift: data.shift || 'morning_inbound',
        departureTime: data.departureTime || '08:00',
        arrivalTime: data.arrivalTime || '08:45',
        busReg: data.busReg || 'BUS-SH-104',
        driverName: data.driverName || 'Arthur Vance',
        driverPhone: data.driverPhone || '+1 (312) 555-3321',
        occupancyCount: 0,
        capacityTotal: data.capacityTotal || 45,
        status: 'scheduled',
        ...data,
      };
      schedulesState = [...schedulesState, newSchedule];
      return newSchedule;
    }
  },

  updateScheduleStatus: async (
    id: string,
    status: ShuttleSchedule['status']
  ): Promise<ShuttleSchedule> => {
    try {
      const response = await apiClient.patch(`/api/v1/shuttle/schedules/${id}/`, { status });
      return response.data;
    } catch {
      const index = schedulesState.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Schedule not found');
      const updated: ShuttleSchedule = { ...schedulesState[index], status };
      schedulesState[index] = updated;
      return updated;
    }
  },

  getPassengers: async (routeId?: string): Promise<ShuttlePassenger[]> => {
    try {
      const response = await apiClient.get('/api/v1/shuttle/passengers/', { params: { routeId } });
      return response.data;
    } catch {
      if (routeId) return passengersState.filter((p) => p.assignedRouteId === routeId);
      return passengersState;
    }
  },

  markPassengerBoarded: async (
    passengerId: string,
    hasBoarded: boolean
  ): Promise<ShuttlePassenger> => {
    try {
      const response = await apiClient.post(`/api/v1/shuttle/passengers/${passengerId}/board/`, { hasBoarded });
      return response.data;
    } catch {
      const index = passengersState.findIndex((p) => p.id === passengerId);
      if (index === -1) throw new Error('Passenger not found');
      const updated: ShuttlePassenger = {
        ...passengersState[index],
        hasBoardedToday: hasBoarded,
        boardingTimestamp: hasBoarded ? new Date().toTimeString().slice(0, 5) : undefined,
      };
      passengersState[index] = updated;
      return updated;
    }
  },
};
