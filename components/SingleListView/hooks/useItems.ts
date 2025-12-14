import { useContext, useRef, useState } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext/ShopSmartContext";
import { categorizeItem } from "@/services/geminiService";
import { ListItem } from "@/model/types";
import { UserContext } from "@/context/UserContext";

export function useItems() {
  const { t, lang, user } = useContext(UserContext);
  const { addItemToList, lists, activeListId, activeList } = useContext(ShopSmartContext);
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
  };

  const handleAddItem = async (itemName?: string) => {
    if (!activeListId) return;

    const currentText = itemName || newItemText;
    if (!currentText.trim() || !activeListId || !user) return;

    if (activeList.items.some(item => item.name.toLowerCase() === currentText.toLowerCase())) {
      setNewItemText("");
      return;
    }

    setNewItemText("");
    setIsCategorizing(true);

    const detectedGroupId = await categorizeItem(currentText, lang);

    const newItem: ListItem = {
      id: Date.now().toString(),
      name: currentText,
      groupId: detectedGroupId,
      isChecked: false,
      addedBy: user.uid,
      timestamp: Date.now(),
      quantity: 1,
    };

    addItemToList(activeList.id, newItem);
    setIsCategorizing(false);
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



