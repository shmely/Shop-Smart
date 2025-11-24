import { TRANSLATIONS } from "@/configuration/constants";
import { PlusIcon } from "@/configuration/icons";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { categorizeItem } from "@/services/geminiService";
import { ListItem, Notification } from "@/types";
import {
  useContext,
  useRef,
  useState,
} from "react";

export default function SingleListViewFooter() {
  const {
    activeList,
    lang,
    setLists,
    activeListId,
    lists,
    user,
  } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];
  const [newItemText, setNewItemText] =
    useState("");
  const [isCategorizing, setIsCategorizing] =
    useState(false);
  const [notification, setNotification] =
    useState<Notification | null>(null);
  const pendingItemsRef = useRef<string[]>([]);
  const notificationTimerRef = useRef<
    number | null
  >(null);

  const triggerSimulatedNotification = (
    items: string[]
  ) => {
    const activeList = lists.find(
      (l) => l.id === activeListId
    );
    const listName = activeList
      ? activeList.name
      : "Shopping List";

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
    if (
      !newItemText.trim() ||
      !activeListId ||
      !user
    )
      return;

    const currentText = newItemText;
    setNewItemText(""); // Optimistic UI clear
    setIsCategorizing(true);

    // 1. Gemini Categorization
    const detectedGroupId = await categorizeItem(
      currentText,
      lang
    );

    const newItem: ListItem = {
      id: Date.now().toString(),
      name: currentText,
      groupId: detectedGroupId,
      isChecked: false,
      addedBy: user.id,
      timestamp: Date.now(),
    };

    // 2. Update List State
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          return {
            ...list,
            items: [...list.items, newItem],
          };
        }
        return list;
      })
    );

    setIsCategorizing(false);

    // 3. Notification Logic (Debounce)
    // In a real app, this logic happens on the receiver's device or server.
    // Here we simulate "sending" it, and we'll trigger a notification
    // as if WE were the other user receiving it (for demo purposes).

    // Add item name to pending queue
    pendingItemsRef.current.push(currentText);

    // Clear existing timer
    if (notificationTimerRef.current) {
      window.clearTimeout(
        notificationTimerRef.current
      );
    }

    // Set new timer for 1 minute (60000ms)
    notificationTimerRef.current =
      window.setTimeout(() => {
        // This part would actually happen on the OTHER user's device in reality.
        console.log(
          "Dispatching notification for items:",
          pendingItemsRef.current
        );

        // Only trigger if we pretend to be the other user, OR just show it for feedback
        triggerSimulatedNotification([
          ...pendingItemsRef.current,
        ]);

        // Reset
        pendingItemsRef.current = [];
      }, 60000);
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-8 shadow-lg">
      <div className="max-w-3xl mx-auto relative">
        <input
          type="text"
          value={newItemText}
          onChange={(e) =>
            setNewItemText(e.target.value)
          }
          onKeyDown={(e) =>
            e.key === "Enter" && handleAddItem()
          }
          placeholder={t.add_item}
          className="w-full bg-gray-100 text-gray-900 rounded-full pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
          disabled={isCategorizing}
        />
        <button
          onClick={handleAddItem}
          disabled={
            !newItemText.trim() || isCategorizing
          }
          className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${
            newItemText.trim()
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-300 text-gray-500"
          } rtl:right-auto rtl:left-2`}
        >
          {isCategorizing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <PlusIcon />
          )}
        </button>
      </div>
      {isCategorizing && (
        <div className="text-center text-xs text-emerald-600 mt-2 font-medium animate-pulse">
          ✨ {t.smart_sort}
        </div>
      )}
    </div>
  );
}
