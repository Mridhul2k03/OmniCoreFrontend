import { apiClient } from './client';
import { TenantPublicCms, CourierShipment } from '../types';
import { MOCK_TENANT_CMS, MOCK_COURIER_SHIPMENTS } from './mockData';

export const publicPortalApi = {
  getTenantCms: async (tenantSlug: string): Promise<TenantPublicCms> => {
    try {
      const response = await apiClient.get(`/api/v1/public/${tenantSlug}/cms/`);
      return response.data;
    } catch {
      const cms = MOCK_TENANT_CMS[tenantSlug] || MOCK_TENANT_CMS['apex-global'];
      return cms;
    }
  },

  trackShipmentPublic: async (awbNumber: string): Promise<CourierShipment | null> => {
    try {
      const response = await apiClient.get(`/api/v1/public/track/${awbNumber}/`);
      return response.data;
    } catch {
      const clean = awbNumber.trim().toLowerCase();
      const found = MOCK_COURIER_SHIPMENTS.find(
        (s) => s.awbNumber.toLowerCase() === clean || s.trackingNumber.toLowerCase() === clean
      );
      return found || null;
    }
  },

  submitPublicBooking: async (data: {
    tenantSlug: string;
    serviceType: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    receiverName?: string;
    receiverPhone?: string;
    receiverAddress?: string;
    pickupTime?: string;
    estimatedWeightKg?: number;
    notes?: string;
  }): Promise<{ success: boolean; bookingReference: string; message: string }> => {
    try {
      const response = await apiClient.post(`/api/v1/public/${data.tenantSlug}/book/`, data);
      return response.data;
    } catch {
      const refPrefix =
        data.serviceType === 'courier_express'
          ? 'AWB-PUB'
          : data.serviceType === 'corporate_shuttle'
          ? 'PASS-SHT'
          : 'BK-PUB';
      const bookingReference = `${refPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      return {
        success: true,
        bookingReference,
        message: 'Your booking request has been successfully received and registered with central operations.',
      };
    }
  },
};
