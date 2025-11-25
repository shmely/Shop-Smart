import { useContext, useRef, useState } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { categorizeItem } from "@/services/geminiService";
import { ListItem } from "@/types";
import { TRANSLATIONS } from "@/configuration/constants";

export function useFooterLogic() {
  const {
    setNotification,
    lang,
    setLists,
    activeListId,
    lists,
    user,
  } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];
  const [newItemText, setNewItemText] = useState("");
  const [isCategorizing, setIsCategorizing] = useState(false);
  const pendingItemsRef = useRef<string[]>([]);
  const notificationTimerRef = useRef<number | null>(null);

  const triggerSimulatedNotification = (items: string[]) => {
    const activeList = lists.find((l) => l.id === activeListId);
    const listName = activeList ? activeList.name : "Shopping List";
    let message = "";

    if (items.length === 1) {
      message = `${items[0]} ${t.notification_single_item} ${listName}`;
    } else {
      message = `${t.notification_new_items} ${listName}`;
    }

    setNotification({
      id: Date.now().toString(),
      message,
      listName,
      timestamp: Date.now(),
    });
  };

  const handleAddItem = async () => {
    if (!newItemText.trim() || !activeListId || !user) return;

    const currentText = newItemText;
    setNewItemText("");
    setIsCategorizing(true);

    const detectedGroupId = await categorizeItem(currentText, lang);

    const newItem: ListItem = {
      id: Date.now().toString(),
      name: currentText,
      groupId: detectedGroupId,
      isChecked: false,
      addedBy: user.id,
      timestamp: Date.now(),
    };

    setLists((prev) =>
      prev.map((list) =>
        list.id === activeListId
          ? { ...list, items: [...list.items, newItem] }
          : list
      )
    );

    setIsCategorizing(false);

    pendingItemsRef.current.push(currentText);

    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }

    notificationTimerRef.current = window.setTimeout(() => {
      triggerSimulatedNotification([...pendingItemsRef.current]);
      pendingItemsRef.current = [];
    }, 1000);
  };

  return {
    t,
    newItemText,
    setNewItemText,
    isCategorizing,
    handleAddItem,
  };
}