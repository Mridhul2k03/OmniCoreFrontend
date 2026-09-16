import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { courierApi } from '../../api/courier.api';
import {
  CourierShipment,
  CourierShipmentStatus,
  MultiPointPickup,
  ProofOfDelivery,
} from '../../types';

// ==================== QUERIES ====================

export function useCourierShipments(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.courier.shipments(filters),
    queryFn: async () => {
      const all = await courierApi.getShipments();
      let filtered = all;
      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter((s) => s.currentStatus === filters.status);
      }
      if (filters?.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        filtered = filtered.filter(
          (s) =>
            s.awbNumber.toLowerCase().includes(q) ||
            s.sender.name.toLowerCase().includes(q) ||
            s.receiver.name.toLowerCase().includes(q)
        );
      }
      return filtered;
    },
  });
}

export function useCourierShipmentByAwb(awbNumber: string) {
  return useQuery({
    queryKey: queryKeys.courier.tracking(awbNumber),
    queryFn: () => courierApi.getShipmentByAwb(awbNumber),
    enabled: Boolean(awbNumber && awbNumber.trim().length > 0),
  });
}

export function useCourierPickups() {
  return useQuery({
    queryKey: queryKeys.courier.pickups,
    queryFn: () => courierApi.getMultiPointPickups(),
  });
}

export function useCourierHubs() {
  return useQuery({
    queryKey: queryKeys.courier.hubs,
    queryFn: () => courierApi.getDeliveryHubs(),
  });
}

export function useCourierSortingRecords() {
  return useQuery({
    queryKey: queryKeys.courier.sortingRecords,
    queryFn: () => courierApi.getSortingRecords(),
  });
}

export function useCourierAgents() {
  return useQuery({
    queryKey: queryKeys.courier.agents,
    queryFn: () => courierApi.getCourierAgents(),
  });
}

export function useCourierCommissions(agentId?: string) {
  return useQuery({
    queryKey: queryKeys.courier.commissions(agentId),
    queryFn: () => courierApi.getAgentCommissions(agentId),
  });
}

export function useCourierPayouts() {
  return useQuery({
    queryKey: queryKeys.courier.payouts,
    queryFn: () => courierApi.getAgentPayouts(),
  });
}

// ==================== MUTATIONS ====================

export function useCreateShipmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => courierApi.createShipment(payload),
    onSuccess: (newShipment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.all });
      queryClient.setQueryData(
        queryKeys.courier.tracking(newShipment.awbNumber),
        newShipment
      );
    },
  });
}

export function useUpdateShipmentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      status,
      location,
      notes,
    }: {
      shipmentId: string;
      status: CourierShipmentStatus;
      location?: string;
      notes?: string;
    }) => courierApi.updateShipmentStatus(shipmentId, status, location, notes),
    onSuccess: (updatedShipment) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.all });
      queryClient.setQueryData(
        queryKeys.courier.tracking(updatedShipment.awbNumber),
        updatedShipment
      );
    },
  });
}

export function useVerifyPodMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      podData,
    }: {
      shipmentId: string;
      podData: ProofOfDelivery;
    }) => courierApi.verifyProofOfDelivery(shipmentId, podData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.all });
    },
  });
}

export function useRecordFailedAttemptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      shipmentId,
      reason,
      agentName,
    }: {
      shipmentId: string;
      reason: string;
      agentName?: string;
    }) => courierApi.recordDeliveryAttempt(shipmentId, reason, agentName || 'Courier Field Agent'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.all });
    },
  });
}

export function useCreatePickupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<MultiPointPickup>) => courierApi.createMultiPointPickup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.pickups });
    },
  });
}

export function useUpdatePickupStopMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pickupId,
      stopId,
      status,
    }: {
      pickupId: string;
      stopId: string;
      status: 'pending' | 'completed' | 'picked_up' | 'assigned' | 'failed';
    }) => courierApi.updatePickupStopStatus(pickupId, stopId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.pickups });
    },
  });
}

export function useProcessSortingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      awbNumber,
      sourceHub,
      destinationHub,
      sortingCategory,
      scannedBy,
    }: {
      awbNumber: string;
      sourceHub: string;
      destinationHub: string;
      sortingCategory: any;
      scannedBy: string;
    }) =>
      courierApi.scanAndSortShipment(
        awbNumber,
        sourceHub,
        destinationHub,
        sortingCategory,
        scannedBy
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.hubs });
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.sortingRecords });
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.shipments() });
    },
  });
}

export function useApprovePayoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutId: string) => courierApi.approvePayout(payoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.payouts });
      queryClient.invalidateQueries({ queryKey: queryKeys.courier.commissions() });
    },
  });
}
