import { useContext, useMemo, useState } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { DEFAULT_GROUPS, TRANSLATIONS } from "@/configuration/constants";
import { Group, GroupId, ListItem } from "@/types";

export function useSingleListViewMain() {
  const {
    activeList,
    lang,
    setLists,
    activeListId,
    user,
    updateListItems
  } = useContext(ShopSmartContext);

  const t = TRANSLATIONS[lang];
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [collapsedDoneItems, setCollapsedDoneItems] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);


  const saveCustomGroupOrder = (reorderedGroups: Group[]) => {
    // Create a new order map: { groupId: newOrderIndex, ... }
    const newOrderMap = reorderedGroups.reduce((acc, group, index) => {
      acc[group.id] = index;
      return acc;
    }, {} as { [key in GroupId]?: number });

    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          return { ...list, customGroupOrder: newOrderMap };
        }
        return list;
      })
    );
    setIsSettingsModalOpen(false); // Close modal on save
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (!activeList) return;
    const newItems = activeList.items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    // Call the context function to update Firestore
    updateListItems(activeList.id, newItems);
  };

  const sortedGroups = useMemo(() => {
    return [...DEFAULT_GROUPS].sort((a, b) => {
      const orderA = activeList?.customGroupOrder?.[a.id] ?? a.order;
      const orderB = activeList?.customGroupOrder?.[b.id] ?? b.order;
      return orderA - orderB;
    });
  }, [activeList]);

  const groupedItems = useMemo(() => {
    if (!activeList?.items) return [];

    const itemsByGroup = activeList.items.reduce((acc, item) => {
      const groupId = item.groupId || GroupId.OTHER;
      if (!acc[groupId]) {
        acc[groupId] = [];
      }
      acc[groupId].push(item);
      return acc;
    }, {} as { [key: string]: ListItem[] });

    return sortedGroups
      .map((group) => ({
        group,
        items: itemsByGroup[group.id] || [],
      }))
      .filter((group) => group.items.length > 0);
  }, [activeList, sortedGroups]); // Make sure `activeList` is a dependency



  const toggleItem = (itemId: string) => {

    if (!activeList) return;

    const newItems = activeList.items.map((item) =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
    );
    updateListItems(activeList.id, newItems);
  };
  const deleteAllDoneItems = () => {
    if (!activeList) return;

    const newItems = activeList.items.filter((item) => item.isChecked);

    updateListItems(activeList.id, newItems);  
  };

  const deleteItem = (itemId: string) => {
    if (!activeList) return;
    const newItems = activeList.items.filter((item) => item.id !== itemId);
    // Call the context function to update Firestore
    updateListItems(activeList.id, newItems);
  };

  const updateItemGroup = (itemId: string, newGroupId: GroupId) => {
    if (!activeList) return;

    const newItems = activeList.items.map((item) =>
      item.id === itemId ? { ...item, groupId: newGroupId } : item
    );
    updateListItems(activeList.id, newItems);
    setEditingItem(null);
  };

  return {
    t,
    groupedItems,
    toggleItem,
    user,
    activeList,
    collapsedDoneItems,
    setCollapsedDoneItems,
    updateItemQuantity,
    deleteAllDoneItems,
    deleteItem,
    updateItemGroup,
    setEditingItem,
    editingItem,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    saveCustomGroupOrder,
    sortedGroups,
  };
}