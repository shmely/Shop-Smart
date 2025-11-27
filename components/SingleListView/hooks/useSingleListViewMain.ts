import { useContext, useMemo } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { DEFAULT_GROUPS, TRANSLATIONS, OTHER_USER } from "@/configuration/constants";
import { GroupId } from "@/types";

export function useSingleListViewMain() {
  const {
    activeList,
    lang,
    setLists,
    activeListId,
    user,
  } = useContext(ShopSmartContext);

  const t = TRANSLATIONS[lang];

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

  return {
    t,
    groupedItems,
    toggleItem,
    user,
  };
}