import { apiClient } from './client';
import { MaintenanceRecord } from '../types';
import { MOCK_MAINTENANCE } from './mockData';

export const maintenanceApi = {
  getRecords: async (): Promise<MaintenanceRecord[]> => {
    try {
      const response = await apiClient.get<MaintenanceRecord[]>('/maintenance/');
      return response.data;
    } catch {
      return MOCK_MAINTENANCE;
    }
  },

  createRecord: async (payload: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
    try {
      const response = await apiClient.post<MaintenanceRecord>('/maintenance/', payload);
      return response.data;
    } catch {
      const newM: MaintenanceRecord = {
        id: 'maint_' + Math.random().toString(36).substring(2, 7),
        recordCode: 'WO-2026-' + Math.floor(500 + Math.random() * 500),
        vehicleId: payload.vehicleId || 'veh_01',
        vehicleReg: payload.vehicleReg || 'IL-9428-TX',
        type: payload.type || 'preventive',
        status: payload.status || 'scheduled',
        reportedDate: new Date().toISOString().split('T')[0],
        odometerAtService: payload.odometerAtService || 85000,
        workshopName: payload.workshopName || 'Apex Central Workshop',
        technicianName: payload.technicianName || 'Certified Technician',
        issueDescription: payload.issueDescription || 'Scheduled preventative service inspection',
        actionTaken: payload.actionTaken || 'Initial diagnostic completed',
        partsConsumed: payload.partsConsumed || [],
        laborCost: payload.laborCost || 150,
        totalCost: payload.totalCost || 150,
      };
      MOCK_MAINTENANCE.unshift(newM);
      return newM;
    }
  },
};
