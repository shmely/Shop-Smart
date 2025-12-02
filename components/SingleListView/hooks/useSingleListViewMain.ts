import { useMemo, useState, useContext, useRef } from "react"; // useRef is new
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { Group, GroupId, ListItem } from "@/types";
import { DEFAULT_GROUPS } from "@/configuration/constants";
import { TRANSLATIONS } from "@/configuration/constants";

export function useSingleListViewMain() {
  const { activeList, lang, updateCustomerGroupOrder } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];

  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [collapsedDoneItems, setCollapsedDoneItems] = useState(true);

  // This is the single source of truth for the order being displayed.
  const [sortedGroups, setSortedGroups] = useState<Group[]>([]);
  
  // This will hold the original order when the modal is opened, for the "Cancel" action.
  const originalOrderRef = useRef<Group[]>([]);

  // This useMemo now ONLY calculates the order from the database.
  const groupsFromDB = useMemo(() => {
    const customOrder = activeList?.customGroupOrder;
    const groupsToSort: Group[] = JSON.parse(JSON.stringify(DEFAULT_GROUPS));
    if (customOrder) {
      groupsToSort.sort((a, b) => {
        const orderA = customOrder[a.id] ?? 99;
        const orderB = customOrder[b.id] ?? 99;
        return orderA - orderB;
      });
    }
    return groupsToSort;
  }, [activeList?.customGroupOrder]);

  // When the modal is NOT open, always show the order from the database.
  if (!isSettingsModalOpen && sortedGroups !== groupsFromDB) {
    setSortedGroups(groupsFromDB);
  }

  const handleOpenSettings = () => {
    // 1. Set the current state to the DB order.
    setSortedGroups(groupsFromDB);
    // 2. Save a copy of this original order in case of cancel.
    originalOrderRef.current = groupsFromDB;
    // 3. Open the modal.
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    // On cancel, restore the original order we saved.
    setSortedGroups(originalOrderRef.current);
    setIsSettingsModalOpen(false);
  };

  const handleSaveOrder = async () => {
    const newOrderMap = sortedGroups.reduce((acc, group, index) => {
      acc[group.id] = index;
      return acc;
    }, {} as { [key in GroupId]?: number });

    await updateCustomerGroupOrder(newOrderMap);
    setIsSettingsModalOpen(false); // Just close the modal. The state is already correct.
  };

  const groupedItems = useMemo(() => {
    if (!activeList?.items) return [];
    return sortedGroups.map((group) => ({
      group,
      items: activeList.items.filter((item) => item.groupId === group.id),
    }));
  }, [activeList?.items, sortedGroups]);

  return {
    t,
    groupedItems,
    collapsedDoneItems,
    setCollapsedDoneItems,
    editingItem,
    setEditingItem,
    isSettingsModalOpen,
    sortedGroups,
    setSortedGroups, // The modal needs this for dragging
    handleOpenSettings,
    handleCloseSettings, // This is now the "Cancel" handler
    handleSaveOrder,
  };
}