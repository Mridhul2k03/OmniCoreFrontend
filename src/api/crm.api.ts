import { apiClient } from './client';
import { Customer, Lead } from '../types';
import { MOCK_CUSTOMERS, MOCK_LEADS } from './mockData';

export const crmApi = {
  getLeads: async (): Promise<Lead[]> => {
    try {
      const response = await apiClient.get<Lead[]>('/crm/leads/');
      return response.data;
    } catch {
      return MOCK_LEADS;
    }
  },

  updateLeadStage: async (leadId: string, stage: Lead['stage']): Promise<Lead> => {
    try {
      const response = await apiClient.patch<Lead>(`/crm/leads/${leadId}/stage/`, { stage });
      return response.data;
    } catch {
      const lead = MOCK_LEADS.find((l) => l.id === leadId);
      if (!lead) throw new Error('Lead not found');
      lead.stage = stage;
      return { ...lead };
    }
  },

  getCustomers: async (): Promise<Customer[]> => {
    try {
      const response = await apiClient.get<Customer[]>('/crm/customers/');
      return response.data;
    } catch {
      return MOCK_CUSTOMERS;
    }
  },
};
