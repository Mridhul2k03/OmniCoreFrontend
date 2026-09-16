import { apiClient } from './client';
import { Invoice } from '../types';
import { MOCK_INVOICES } from './mockData';

export interface FinanceSummary {
  totalRevenue: number;
  totalCollections: number;
  outstandingBalance: number;
  fuelExpenses: number;
  tollExpenses: number;
  maintenanceExpenses: number;
  payrollExpenses: number;
  netMargin: number;
  monthlyRevenueSeries: { month: string; revenue: number; expenses: number; profit: number }[];
}

export const financeApi = {
  getSummary: async (): Promise<FinanceSummary> => {
    try {
      const response = await apiClient.get<FinanceSummary>('/finance/summary/');
      return response.data;
    } catch {
      return {
        totalRevenue: 486500,
        totalCollections: 258728,
        outstandingBalance: 227772,
        fuelExpenses: 78400,
        tollExpenses: 12600,
        maintenanceExpenses: 28900,
        payrollExpenses: 142000,
        netMargin: 224600,
        monthlyRevenueSeries: [
          { month: 'Apr', revenue: 72000, expenses: 48000, profit: 24000 },
          { month: 'May', revenue: 84000, expenses: 53000, profit: 31000 },
          { month: 'Jun', revenue: 98000, expenses: 61000, profit: 37000 },
          { month: 'Jul', revenue: 108000, expenses: 68000, profit: 40000 },
          { month: 'Aug', revenue: 114000, expenses: 71000, profit: 43000 },
          { month: 'Sep', revenue: 122000, expenses: 74000, profit: 48000 },
        ],
      };
    }
  },

  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const response = await apiClient.get<Invoice[]>('/finance/invoices/');
      return response.data;
    } catch {
      return MOCK_INVOICES;
    }
  },

  createInvoice: async (payload: Partial<Invoice>): Promise<Invoice> => {
    try {
      const response = await apiClient.post<Invoice>('/finance/invoices/', payload);
      return response.data;
    } catch {
      const amount = payload.amount || 5000;
      const tax = Math.round(amount * 0.08);
      const newInv: Invoice = {
        id: 'inv_' + Math.random().toString(36).substring(2, 7),
        invoiceNumber: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
        clientName: payload.clientName || 'General Client Corp',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        amount,
        taxAmount: tax,
        totalAmount: amount + tax,
        balanceDue: amount + tax,
        status: 'issued',
        vertical: payload.vertical || 'freight_logistics',
        items: payload.items || [{ description: 'Transport Haulage Billing', quantity: 1, unitPrice: amount, total: amount }],
      };
      MOCK_INVOICES.unshift(newInv);
      return newInv;
    }
  },

  updateInvoiceStatus: async (id: string, status: Invoice['status']): Promise<Invoice> => {
    try {
      const response = await apiClient.patch<Invoice>(`/finance/invoices/${id}/status/`, { status });
      return response.data;
    } catch {
      const inv = MOCK_INVOICES.find((i) => i.id === id);
      if (!inv) throw new Error('Invoice not found');
      inv.status = status;
      if (status === 'paid') inv.balanceDue = 0;
      return { ...inv };
    }
  },
};
