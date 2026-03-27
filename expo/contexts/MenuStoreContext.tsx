import { useCallback, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { initialWeeklyMenu, sampleMenuItems } from '@/mocks/data';
import { MenuItem, WeeklyDay, WeeklyMenuItem } from '@/types';

interface MenuStoreValue {
  menuItems: MenuItem[];
  weeklyDays: WeeklyDay[];
  addItem: (item: MenuItem) => void;
  updateItem: (item: MenuItem) => void;
  deleteItem: (id: string) => void;
  addWeeklyItem: (item: WeeklyMenuItem, toDayID: string) => void;
  removeWeeklyItem: (id: string, fromDayID: string) => void;
}

export const [MenuStoreProvider, useMenuStore] = createContextHook<MenuStoreValue>(() => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems);
  const [weeklyDays, setWeeklyDays] = useState<WeeklyDay[]>(initialWeeklyMenu);

  const addItem = useCallback((item: MenuItem) => {
    console.log('[MenuStore] Adding menu item:', item.name, 'period:', item.mealPeriod);
    const fullItem: MenuItem = {
      ...item,
      ingredients: item.ingredients || '',
      nutrition: item.nutrition || { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      availability: item.availability || 'available',
      lastUpdated: new Date(),
    };
    setMenuItems((prev) => [...prev, fullItem]);
  }, []);

  const updateItem = useCallback((item: MenuItem) => {
    console.log('[MenuStore] Updating menu item:', item.id, item.name);
    const fullItem: MenuItem = {
      ...item,
      ingredients: item.ingredients || '',
      nutrition: item.nutrition || { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      availability: item.availability || 'available',
      lastUpdated: new Date(),
    };
    setMenuItems((prev) => prev.map((existing) => (existing.id === fullItem.id ? fullItem : existing)));
  }, []);

  const deleteItem = useCallback((id: string) => {
    console.log('[MenuStore] Deleting menu item:', id);
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addWeeklyItem = useCallback((item: WeeklyMenuItem, toDayID: string) => {
    console.log('[MenuStore] Adding weekly item:', item.name, 'day:', toDayID, 'period:', item.mealPeriod);
    setWeeklyDays((prev) => prev.map((day) => (day.id === toDayID ? { ...day, items: [...day.items, item] } : day)));
  }, []);

  const removeWeeklyItem = useCallback((id: string, fromDayID: string) => {
    console.log('[MenuStore] Removing weekly item:', id, 'from day:', fromDayID);
    setWeeklyDays((prev) => prev.map((day) => (day.id === fromDayID ? { ...day, items: day.items.filter((item) => item.id !== id) } : day)));
  }, []);

  return useMemo<MenuStoreValue>(() => ({
    menuItems,
    weeklyDays,
    addItem,
    updateItem,
    deleteItem,
    addWeeklyItem,
    removeWeeklyItem,
  }), [addItem, addWeeklyItem, deleteItem, menuItems, removeWeeklyItem, updateItem, weeklyDays]);
});
