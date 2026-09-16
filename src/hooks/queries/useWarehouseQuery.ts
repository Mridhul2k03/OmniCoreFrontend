import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { warehouseApi } from '../../api/warehouse.api';
import { CrossDockRecord, ShipmentConsolidationGroup, SparePart } from '../../types';

// ==================== QUERIES ====================

export function useWarehouseFacilities() {
  return useQuery({
    queryKey: queryKeys.warehouse.facilities,
    queryFn: () => warehouseApi.getWarehouses(),
  });
}

export function useWarehouseInventory(warehouseId?: string) {
  return useQuery({
    queryKey: queryKeys.warehouse.inventory({ warehouseId }),
    queryFn: () => warehouseApi.getSpareParts({ warehouseId }),
  });
}

export function useCrossDockOperations() {
  return useQuery({
    queryKey: queryKeys.warehouse.crossDock(),
    queryFn: () => warehouseApi.getCrossDockRecords(),
  });
}

export function useConsolidationGroups() {
  return useQuery({
    queryKey: queryKeys.warehouse.consolidation(),
    queryFn: () => warehouseApi.getConsolidationGroups(),
  });
}

// ==================== MUTATIONS ====================

export function useUpdateCrossDockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      sortingStatus,
      dispatchStatus,
      consolidationGroupRef,
    }: {
      id: string;
      sortingStatus?: CrossDockRecord['sortingStatus'];
      dispatchStatus?: CrossDockRecord['dispatchStatus'];
      consolidationGroupRef?: string;
    }) => warehouseApi.updateCrossDockStatus(id, sortingStatus, dispatchStatus, consolidationGroupRef),
    onSuccess: (updatedRecord: CrossDockRecord) => {
      queryClient.setQueryData(
        queryKeys.warehouse.crossDock(),
        (old: CrossDockRecord[] | undefined) => {
          if (!old) return [updatedRecord];
          return old.map((rec) => (rec.id === updatedRecord.id ? updatedRecord : rec));
        }
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.crossDock() });
    },
  });
}

export function useSealConsolidationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      sealNumber,
      vehicleReg,
    }: {
      groupId: string;
      sealNumber: string;
      vehicleReg?: string;
    }) => warehouseApi.sealConsolidationGroup(groupId, sealNumber, vehicleReg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.consolidation() });
    },
  });
}

export function useAdjustStockMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      partId,
      delta,
    }: {
      partId: string;
      delta: number;
    }) => warehouseApi.adjustStock(partId, delta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouse.inventory() });
      queryClient.invalidateQueries({ queryKey: ['spareParts'] });
    },
  });
}
