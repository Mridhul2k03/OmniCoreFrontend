import { apiClient } from './client';
import { Vehicle } from '../types';
import { MOCK_VEHICLES } from './mockData';

export const fleetApi = {
  getVehicles: async (params?: { search?: string; status?: string; vertical?: string }): Promise<Vehicle[]> => {
    try {
      const response = await apiClient.get<Vehicle[]>('/fleet/vehicles/', { params });
      return response.data;
    } catch {
      let list = [...MOCK_VEHICLES];
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (v) =>
            v.registrationNumber.toLowerCase().includes(q) ||
            v.make.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            (v.assignedDriverName && v.assignedDriverName.toLowerCase().includes(q))
        );
      }
      if (params?.status && params.status !== 'all') {
        list = list.filter((v) => v.status === params.status);
      }
      if (params?.vertical && params.vertical !== 'all') {
        list = list.filter((v) => v.vertical === params.vertical);
      }
      return list;
    }
  },

  getVehicleById: async (id: string): Promise<Vehicle> => {
    try {
      const response = await apiClient.get<Vehicle>(`/fleet/vehicles/${id}/`);
      return response.data;
    } catch {
      const v = MOCK_VEHICLES.find((item) => item.id === id);
      if (!v) throw new Error('Vehicle not found');
      return v;
    }
  },

  createVehicle: async (payload: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const response = await apiClient.post<Vehicle>('/fleet/vehicles/', payload);
      return response.data;
    } catch {
      const newV: Vehicle = {
        id: 'veh_' + Math.random().toString(36).substring(2, 7),
        tenantId: 'tenant_apex',
        registrationNumber: payload.registrationNumber || 'IL-NEW-99',
        make: payload.make || 'Freightliner',
        model: payload.model || 'Cascadia',
        year: payload.year || 2024,
        type: payload.type || 'heavy_truck',
        vertical: payload.vertical || 'freight_logistics',
        status: 'available',
        vin: payload.vin || '1FUJBBCK4NL' + Math.floor(100000 + Math.random() * 900000),
        fuelType: payload.fuelType || 'diesel',
        odometerKm: payload.odometerKm || 12000,
        fuelLevelPercent: 100,
        capacityKg: payload.capacityKg || 25000,
        documents: [],
        totalTripsCount: 0,
      };
      MOCK_VEHICLES.unshift(newV);
      return newV;
    }
  },

  updateVehicle: async (id: string, payload: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const response = await apiClient.patch<Vehicle>(`/fleet/vehicles/${id}/`, payload);
      return response.data;
    } catch {
      const index = MOCK_VEHICLES.findIndex((v) => v.id === id);
      if (index === -1) throw new Error('Vehicle not found');
      MOCK_VEHICLES[index] = { ...MOCK_VEHICLES[index], ...payload };
      return MOCK_VEHICLES[index];
    }
  },
};
