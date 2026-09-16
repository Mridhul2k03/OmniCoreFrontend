import { apiClient } from './client';
import { Contract, Tender } from '../types';
import { MOCK_CONTRACTS, MOCK_TENDERS } from './mockData';

export const contractsApi = {
  getContracts: async (): Promise<Contract[]> => {
    try {
      const response = await apiClient.get<Contract[]>('/contracts/');
      return response.data;
    } catch {
      return MOCK_CONTRACTS;
    }
  },

  getTenders: async (): Promise<Tender[]> => {
    try {
      const response = await apiClient.get<Tender[]>('/contracts/tenders/');
      return response.data;
    } catch {
      return MOCK_TENDERS;
    }
  },

  createTender: async (payload: Partial<Tender>): Promise<Tender> => {
    try {
      const response = await apiClient.post<Tender>('/contracts/tenders/', payload);
      return response.data;
    } catch {
      const newT: Tender = {
        id: 'tnd_' + Math.random().toString(36).substring(2, 7),
        tenderCode: 'TND-2026-' + Math.floor(1000 + Math.random() * 9000),
        title: payload.title || 'New Tender Proposal',
        clientName: payload.clientName || 'Target Enterprise Client',
        industry: payload.industry || 'Logistics',
        estimatedValue: payload.estimatedValue || 500000,
        submissionDeadline: payload.submissionDeadline || '2026-11-30',
        status: 'draft',
        scopeSummary: payload.scopeSummary || 'Proposal scope details',
        estimatedVehicleRequired: payload.estimatedVehicleRequired || 5,
        costBreakdown: payload.costBreakdown || {
          fleetCosts: 200000,
          fuelEstimates: 120000,
          crewPayroll: 100000,
          margins: 80000,
        },
      };
      MOCK_TENDERS.unshift(newT);
      return newT;
    }
  },
};
