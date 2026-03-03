import { useMemo, useState, useContext } from "react"; // useRef is new
import { UserContext } from "@/context/UserContext";
import { ShopSmartContext } from "@/context/ShopSmartContext/ShopSmartContext";
import { GroupedItem } from "@/common/model/types";



export function useSingleListViewMain() {
  const { t } = useContext(UserContext);
  const { sortedGroups, activeList } = useContext(ShopSmartContext);
  const [collapsedDoneItems, setCollapsedDoneItems] = useState(true);

  const groupedItems: GroupedItem[] = useMemo(() => {
    if (!activeList?.items) return [];
    return sortedGroups.map((group) => ({
      group,
      items: activeList.items.filter((item) => item.groupId === group.id),
    }));
  }, [activeList?.items, sortedGroups]);

  const doneGroups = groupedItems.filter(({ items }) => items.some((item) => item.isChecked));
  const doneItemsCount = doneGroups.reduce(
    (acc, group) => acc + group.items.filter((item) => item.isChecked).length,
    0
  );

  return {
    t,
    groupedItems,
    collapsedDoneItems,
    setCollapsedDoneItems,
    doneGroups,
    doneItemsCount
  };
}