import { apiClient } from './client';
import {
  CourierShipment,
  CourierShipmentStatus,
  ProofOfDelivery,
  MultiPointPickup,
  DeliveryHub,
  SortingRecord,
  CourierAgent,
  AgentCommission,
  AgentPayout,
} from '../types';
import {
  MOCK_COURIER_SHIPMENTS,
  MOCK_MULTI_POINT_PICKUPS,
  MOCK_DELIVERY_HUBS,
  MOCK_SORTING_RECORDS,
  MOCK_COURIER_AGENTS,
  MOCK_AGENT_COMMISSIONS,
  MOCK_AGENT_PAYOUTS,
} from './mockData';

let shipmentsState = [...MOCK_COURIER_SHIPMENTS];
let pickupsState = [...MOCK_MULTI_POINT_PICKUPS];
let hubsState = [...MOCK_DELIVERY_HUBS];
let sortingState = [...MOCK_SORTING_RECORDS];
let agentsState = [...MOCK_COURIER_AGENTS];
let commissionsState = [...MOCK_AGENT_COMMISSIONS];
let payoutsState = [...MOCK_AGENT_PAYOUTS];

export const courierApi = {
  getShipments: async (): Promise<CourierShipment[]> => {
    try {
      const response = await apiClient.get('/api/v1/courier/shipments/');
      return response.data;
    } catch {
      return shipmentsState;
    }
  },

  getShipmentByAwb: async (awbNumber: string): Promise<CourierShipment | null> => {
    try {
      const response = await apiClient.get(`/api/v1/courier/shipments/${awbNumber}/`);
      return response.data;
    } catch {
      const found = shipmentsState.find(
        (s) => s.awbNumber.toLowerCase() === awbNumber.toLowerCase().trim() ||
               s.trackingNumber.toLowerCase() === awbNumber.toLowerCase().trim()
      );
      return found || null;
    }
  },

  createShipment: async (data: Partial<CourierShipment>): Promise<CourierShipment> => {
    try {
      const response = await apiClient.post('/api/v1/courier/shipments/', data);
      return response.data;
    } catch {
      const newShipment: CourierShipment = {
        id: `shp_${Date.now()}`,
        awbNumber: `AWB-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
        trackingNumber: `TRK-${Math.floor(10000 + Math.random() * 90000)}-US`,
        tenantId: data.tenantId || 'tenant_apex',
        sender: data.sender || { name: 'Direct Merchant', phone: '+1 555-0000', address: 'Chicago Hub', city: 'Chicago', postalCode: '60601' },
        receiver: data.receiver || { name: 'Customer Consignee', phone: '+1 555-9999', address: 'Delivery Address', city: 'Chicago', postalCode: '60602' },
        parcel: data.parcel || { weightKg: 2.5, lengthCm: 20, widthCm: 15, heightCm: 10, declaredValue: 150, description: 'General Express Parcel', isFragile: false },
        serviceType: data.serviceType || 'same_day',
        currentStatus: 'pickup_pending',
        currentHubName: 'Chicago Central Sort Facility',
        expectedDeliveryDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
        codAmount: data.codAmount || 0,
        codCollected: false,
        timeline: [
          {
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            location: 'Origin Terminal',
            status: 'pickup_pending',
            description: 'AWB generated and registered with central dispatch',
            actor: 'Merchant API',
          },
        ],
        deliveryAttempts: [],
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        ...data,
      };
      shipmentsState = [newShipment, ...shipmentsState];
      return newShipment;
    }
  },

  updateShipmentStatus: async (
    id: string,
    status: CourierShipmentStatus,
    note?: string,
    location?: string
  ): Promise<CourierShipment> => {
    try {
      const response = await apiClient.patch(`/api/v1/courier/shipments/${id}/status/`, { status, note, location });
      return response.data;
    } catch {
      const index = shipmentsState.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Shipment not found');
      const updated: CourierShipment = {
        ...shipmentsState[index],
        currentStatus: status,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        timeline: [
          ...shipmentsState[index].timeline,
          {
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            location: location || shipmentsState[index].currentHubName || 'Transit Network',
            status,
            description: note || `Status updated to ${status.replace(/_/g, ' ')}`,
            actor: 'Station Dispatcher',
          },
        ],
      };
      shipmentsState[index] = updated;
      return updated;
    }
  },

  verifyProofOfDelivery: async (
    id: string,
    pod: ProofOfDelivery
  ): Promise<CourierShipment> => {
    try {
      const response = await apiClient.post(`/api/v1/courier/shipments/${id}/pod/`, pod);
      return response.data;
    } catch {
      const index = shipmentsState.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Shipment not found');
      const updated: CourierShipment = {
        ...shipmentsState[index],
        currentStatus: 'delivered',
        actualDeliveryDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
        pod: {
          ...pod,
          status: 'pod_verified',
          deliveryTimestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        },
        timeline: [
          ...shipmentsState[index].timeline,
          {
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            location: shipmentsState[index].receiver.address,
            status: 'delivered',
            description: `Delivered verified via ${pod.confirmationMethod.replace('_', ' ').toUpperCase()}`,
            actor: pod.agentName || 'Courier Agent',
          },
        ],
      };
      shipmentsState[index] = updated;
      return updated;
    }
  },

  recordDeliveryAttempt: async (
    id: string,
    reason: string,
    agentName: string
  ): Promise<CourierShipment> => {
    try {
      const response = await apiClient.post(`/api/v1/courier/shipments/${id}/attempts/`, { reason, agentName });
      return response.data;
    } catch {
      const index = shipmentsState.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Shipment not found');
      const attemptNum = (shipmentsState[index].deliveryAttempts?.length || 0) + 1;
      const updated: CourierShipment = {
        ...shipmentsState[index],
        currentStatus: 'delivery_failed',
        deliveryAttempts: [
          ...(shipmentsState[index].deliveryAttempts || []),
          {
            attemptNumber: attemptNum,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            reason,
            agentName,
          },
        ],
        timeline: [
          ...shipmentsState[index].timeline,
          {
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            location: shipmentsState[index].receiver.address,
            status: 'delivery_failed',
            description: `Delivery attempt #${attemptNum} failed: ${reason}`,
            actor: agentName,
          },
        ],
      };
      shipmentsState[index] = updated;
      return updated;
    }
  },

  // Multi-point pickups
  getMultiPointPickups: async (): Promise<MultiPointPickup[]> => {
    try {
      const response = await apiClient.get('/api/v1/courier/multi-point-pickups/');
      return response.data;
    } catch {
      return pickupsState;
    }
  },

  createMultiPointPickup: async (data: Partial<MultiPointPickup>): Promise<MultiPointPickup> => {
    try {
      const response = await apiClient.post('/api/v1/courier/multi-point-pickups/', data);
      return response.data;
    } catch {
      const newPickup: MultiPointPickup = {
        id: `mp_${Date.now()}`,
        pickupCode: `MPP-2026-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: 'tenant_apex',
        assignedAgentName: data.assignedAgentName || 'Unassigned',
        destinationHubName: data.destinationHubName || 'Chicago Central Sort Facility',
        totalParcels: data.stops?.reduce((acc, s) => acc + s.parcelCount, 0) || 0,
        overallStatus: 'assigned',
        stops: data.stops || [],
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        ...data,
      };
      pickupsState = [newPickup, ...pickupsState];
      return newPickup;
    }
  },

  updatePickupStopStatus: async (
    pickupId: string,
    stopId: string,
    status: 'pending' | 'assigned' | 'picked_up' | 'failed' | 'completed'
  ): Promise<MultiPointPickup> => {
    try {
      const response = await apiClient.patch(`/api/v1/courier/multi-point-pickups/${pickupId}/stops/${stopId}/`, { status });
      return response.data;
    } catch {
      const index = pickupsState.findIndex((p) => p.id === pickupId);
      if (index === -1) throw new Error('Pickup batch not found');
      const stops = pickupsState[index].stops.map((s) => (s.id === stopId ? { ...s, status } : s));
      const allDone = stops.every((s) => s.status === 'picked_up' || s.status === 'completed');
      const updated: MultiPointPickup = {
        ...pickupsState[index],
        stops,
        overallStatus: allDone ? 'completed' : 'in_progress',
      };
      pickupsState[index] = updated;
      return updated;
    }
  },

  // Delivery Hubs
  getDeliveryHubs: async (): Promise<DeliveryHub[]> => {
    try {
      const response = await apiClient.get('/api/v1/courier/hubs/');
      return response.data;
    } catch {
      return hubsState;
    }
  },

  createDeliveryHub: async (data: Partial<DeliveryHub>): Promise<DeliveryHub> => {
    try {
      const response = await apiClient.post('/api/v1/courier/hubs/', data);
      return response.data;
    } catch {
      const newHub: DeliveryHub = {
        id: `hub_${Date.now()}`,
        name: data.name || 'New Sorting Hub',
        code: data.code || `HUB-${Math.floor(10 + Math.random() * 90)}`,
        city: data.city || 'Chicago, IL',
        address: data.address || 'Central Transit Lane',
        capacityParcels: data.capacityParcels || 15000,
        currentParcelsCount: 0,
        incomingShipmentsCount: 0,
        pendingSortingCount: 0,
        sortedShipmentsCount: 0,
        outgoingShipmentsCount: 0,
        managerName: data.managerName || 'Operations Lead',
        status: 'operational',
        ...data,
      };
      hubsState = [...hubsState, newHub];
      return newHub;
    }
  },

  // Sorting
  getSortingRecords: async (): Promise<SortingRecord[]> => {
    try {
      const response = await apiClient.get('/api/v1/courier/sorting/');
      return response.data;
    } catch {
      return sortingState;
    }
  },

  scanAndSortShipment: async (
    awbNumber: string,
    sourceHub: string,
    destinationHub: string,
    sortingCategory: SortingRecord['sortingCategory'],
    scannedBy: string
  ): Promise<SortingRecord> => {
    try {
      const response = await apiClient.post('/api/v1/courier/sorting/scan/', {
        awbNumber,
        sourceHub,
        destinationHub,
        sortingCategory,
        scannedBy,
      });
      return response.data;
    } catch {
      const newRecord: SortingRecord = {
        id: `sort_${Date.now()}`,
        awbNumber,
        sourceHub,
        destinationHub,
        sortingCategory,
        status: 'sorted',
        scannedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        scannedBy,
      };
      sortingState = [newRecord, ...sortingState];

      // Update matching shipment if exists
      const matchIndex = shipmentsState.findIndex((s) => s.awbNumber.toLowerCase() === awbNumber.toLowerCase());
      if (matchIndex !== -1) {
        shipmentsState[matchIndex] = {
          ...shipmentsState[matchIndex],
          currentStatus: 'sorted',
          timeline: [
            ...shipmentsState[matchIndex].timeline,
            {
              timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
              location: sourceHub,
              status: 'sorted',
              description: `High-speed sort complete. Routed to ${sortingCategory} lane for ${destinationHub}`,
              actor: scannedBy,
            },
          ],
        };
      }
      return newRecord;
    }
  },

  // Courier Agents & Payouts
  getCourierAgents: async (): Promise<CourierAgent[]> => {
    try {
      const response = await apiClient.get('/api/v1/courier/agents/');
      return response.data;
    } catch {
      return agentsState;
    }
  },

  getAgentCommissions: async (agentId?: string): Promise<AgentCommission[]> => {
    try {
      const response = await apiClient.get('/api/v1/courier/commissions/', { params: { agentId } });
      return response.data;
    } catch {
      if (agentId) return commissionsState.filter((c) => c.agentId === agentId);
      return commissionsState;
    }
  },

  getAgentPayouts: async (): Promise<AgentPayout[]> => {
    try {
      const response = await apiClient.get('/api/v1/courier/payouts/');
      return response.data;
    } catch {
      return payoutsState;
    }
  },

  requestPayout: async (data: Partial<AgentPayout>): Promise<AgentPayout> => {
    try {
      const response = await apiClient.post('/api/v1/courier/payouts/', data);
      return response.data;
    } catch {
      const newPayout: AgentPayout = {
        id: `pay_${Date.now()}`,
        payoutReference: `PAY-2026-09-${Math.floor(10 + Math.random() * 90)}`,
        agentId: data.agentId || 'cagent_01',
        agentName: data.agentName || 'Courier Agent',
        periodStart: data.periodStart || '2026-09-01',
        periodEnd: data.periodEnd || '2026-09-15',
        grossEarnings: data.grossEarnings || 800,
        commission: data.commission || 250,
        expenses: data.expenses || 50,
        adjustments: 0,
        netPayable: (data.grossEarnings || 800) + (data.commission || 250) - (data.expenses || 50),
        status: 'pending',
        requestedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        ...data,
      };
      payoutsState = [newPayout, ...payoutsState];
      return newPayout;
    }
  },

  approvePayout: async (payoutId: string): Promise<AgentPayout> => {
    try {
      const response = await apiClient.patch(`/api/v1/courier/payouts/${payoutId}/approve/`);
      return response.data;
    } catch {
      const index = payoutsState.findIndex((p) => p.id === payoutId);
      if (index === -1) throw new Error('Payout record not found');
      const updated: AgentPayout = {
        ...payoutsState[index],
        status: 'paid',
        processedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };
      payoutsState[index] = updated;
      return updated;
    }
  },
};
