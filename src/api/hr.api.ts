import { apiClient } from './client';
import { Employee } from '../types';
import { MOCK_EMPLOYEES } from './mockData';

export const hrApi = {
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const response = await apiClient.get<Employee[]>('/hr/employees/');
      return response.data;
    } catch {
      return MOCK_EMPLOYEES;
    }
  },

  createEmployee: async (payload: Partial<Employee>): Promise<Employee> => {
    try {
      const response = await apiClient.post<Employee>('/hr/employees/', payload);
      return response.data;
    } catch {
      const newE: Employee = {
        id: 'emp_' + Math.random().toString(36).substring(2, 7),
        employeeCode: 'EMP-' + Math.floor(100 + Math.random() * 900),
        firstName: payload.firstName || 'New',
        lastName: payload.lastName || 'Staff',
        email: payload.email || 'staff@apexlogistics.com',
        phone: payload.phone || '+1 (555) 019-2831',
        department: payload.department || 'Operations',
        role: payload.role || 'operations_manager',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
        salary: {
          monthlyBasic: 6000,
          allowances: 1000,
          deductions: 1200,
          netPay: 5800,
        },
      };
      MOCK_EMPLOYEES.unshift(newE);
      return newE;
    }
  },
};
