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
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          const updatedItems = list.items.map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.max(1, quantity) } // Ensure minimum quantity of 1
              : item
          );
          return { ...list, items: updatedItems };
        }
        return list;
      })
    );
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

  const doneGroups = useMemo(
    () =>
      activeList
        ? sortedGroups.filter(
            (group) =>
              activeList.items.filter((item) => item.groupId === group.id)
                .length > 0
          )
        : [],
    [activeList, sortedGroups]
  );

  const toggleItem = (itemId: string) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          const updatedItems = list.items.map(
            (item) =>
              item.id === itemId
                ? { ...item, isChecked: !item.isChecked }
                : item
          );
          return { ...list, items: updatedItems };
        }
        return list;
      })
    );
  };
  const deleteAllDoneItems = () => {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          // Return a new list with only the items that are not checked
          return {
            ...list,
            items: list.items.filter((item) => !item.isChecked),
          };
        }
        return list;
      })
    );
  };

  const deleteItem = (itemId: string) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          // Return a new list with the specific item filtered out
          return {
            ...list,
            items: list.items.filter((item) => item.id !== itemId),
          };
        }
        return list;
      })
    );
  };

  const updateItemGroup = (itemId: string, newGroupId: GroupId) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          return {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId ? { ...item, groupId: newGroupId } : item
            ),
          };
        }
        return list;
      })
    );
    setEditingItem(null); // Close the modal after updating
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