import { useContext, useMemo, useState } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { DEFAULT_GROUPS, TRANSLATIONS } from "@/configuration/constants";
import { GroupId, ListItem } from "@/types";

export function useSingleListViewMain() {
  const {
    activeList,
    lang,
    setLists,
    activeListId,
    user,
  } = useContext(ShopSmartContext);

  const t = TRANSLATIONS[lang];
  const [collapsedDoneItems, setCollapsedDoneItems] = useState<boolean>(true);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
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
      const orderA = activeList?.items?.[a.id] ?? a.order;
      const orderB = activeList?.customGroupOrder?.[b.id] ?? b.order;
      return orderA - orderB;
    });
  }, [activeList]);

  const groupedItems = useMemo(() => {
    if (!activeList) return [];
    const groups = sortedGroups
      .map((group) => {
        const itemsInGroup = activeList.items.filter(
          (i) => i.groupId === group.id
        );
        return {
          group,
          items: itemsInGroup,
        };
      })
      .filter((g) => g.items.length > 0);

    const otherItems = activeList.items.filter(
      (i) => !sortedGroups.find((g) => g.id === i.groupId)
    );
    if (otherItems.length > 0) {
      groups.push({
        group: DEFAULT_GROUPS.find((g) => g.id === GroupId.OTHER)!,
        items: otherItems,
      });
    }
    return groups;
  }, [activeList, sortedGroups]);

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
    editingItem
  };
}