import { useCallback, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { initialInventoryAlerts } from '@/mocks/data';
import { AdminInventoryAlert } from '@/types';

interface InventoryStoreValue {
  alerts: AdminInventoryAlert[];
  resolveAlert: (id: string) => void;
  addAlert: (alert: AdminInventoryAlert) => void;
}

export const [InventoryStoreProvider, useInventoryStore] = createContextHook<InventoryStoreValue>(() => {
  const [alerts, setAlerts] = useState<AdminInventoryAlert[]>(initialInventoryAlerts);

  const resolveAlert = useCallback((id: string) => {
    console.log('[InventoryStore] Resolving alert:', id);
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const addAlert = useCallback((alert: AdminInventoryAlert) => {
    console.log('[InventoryStore] Adding alert:', alert.itemName, 'category:', alert.category);
    setAlerts((prev) => [...prev, alert]);
  }, []);

  return useMemo<InventoryStoreValue>(() => ({
    alerts,
    resolveAlert,
    addAlert,
  }), [addAlert, alerts, resolveAlert]);
});
