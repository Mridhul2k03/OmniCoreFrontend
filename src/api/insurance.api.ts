import { apiClient } from './client';
import { InsuranceClaim, InsurancePolicy } from '../types';
import { MOCK_CLAIMS, MOCK_INSURANCE } from './mockData';

export const insuranceApi = {
  getPolicies: async (): Promise<InsurancePolicy[]> => {
    try {
      const response = await apiClient.get<InsurancePolicy[]>('/insurance/policies/');
      return response.data;
    } catch {
      return MOCK_INSURANCE;
    }
  },

  getClaims: async (): Promise<InsuranceClaim[]> => {
    try {
      const response = await apiClient.get<InsuranceClaim[]>('/insurance/claims/');
      return response.data;
    } catch {
      return MOCK_CLAIMS;
    }
  },
};
