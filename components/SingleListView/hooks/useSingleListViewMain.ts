import { useMemo, useState, useContext } from "react"; // useRef is new
import { UserContext } from "@/context/UserContext";
import { Group, GroupId } from "@/model/types";
import { DEFAULT_GROUPS } from "@/configuration/constants";
import { ShopSmartContext } from "@/context/ShopSmartContext";

export function useSingleListViewMain() {
  const { t } = useContext(UserContext);
  const { updateCustomGroupOrder, activeList } = useContext(ShopSmartContext);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [collapsedDoneItems, setCollapsedDoneItems] = useState(true);
  const [editingGroups, setEditingGroups] = useState<Group[]>([]);

  const sortedGroupsFromDB = useMemo(() => {
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


  const handleOpenSettings = () => {

    setEditingGroups(sortedGroupsFromDB);
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };



  const handleSaveOrder = async () => {
    const newOrderMap = editingGroups.reduce((acc, group, index) => {
      acc[group.id] = index;
      return acc;
    }, {} as { [key in GroupId]?: number });

    // This call now triggers the logic we added in ShopSmartContext
    await updateCustomGroupOrder(newOrderMap);
    setIsSettingsModalOpen(false);
  };

  const groupedItems = useMemo(() => {
    if (!activeList?.items) return [];
    return sortedGroupsFromDB.map((group) => ({
      group,
      items: activeList.items.filter((item) => item.groupId === group.id),
    }));
  }, [activeList?.items, sortedGroupsFromDB]);

  return {
    t,
    groupedItems,
    collapsedDoneItems,
    setCollapsedDoneItems,
    isSettingsModalOpen,
    sortedGroups: editingGroups,
    setSortedGroups: setEditingGroups, // The modal needs this for dragging
    handleOpenSettings,
    handleCloseSettings, // This is now the "Cancel" handler
    handleSaveOrder,
  };
}