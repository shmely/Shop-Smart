import React, {
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import {
  Language,
  ListItem,
  Notification,
} from "./types";
import {
  DEFAULT_GROUPS,
  TRANSLATIONS,
} from "./configuration/constants";
import { categorizeItem } from "./services/geminiService";
import { NotificationToast } from "./components/NotificationToast";
import Login from "./components/Login";
import { ShopSmartContext } from "./context/ShopSmartContext";
import ListOfLists from "./components/ListOfLists";
import {
  ArrowLeftIcon,
  CheckIcon,
  CogIcon,
  PlusIcon,
  ShareIcon,
} from "./configuration/icons";
import SingleListView from "./components/SingleListView";

// --- Main App Component ---
export default function App() {
  // --- State ---
  const {
    lang,
    user,
    lists,
    setLists,
    activeListId,
    setActiveListId,
  } = useContext(ShopSmartContext);

  const [newItemText, setNewItemText] =
    useState("");
  const [isCategorizing, setIsCategorizing] =
    useState(false);

  // Notification State
  const [notification, setNotification] =
    useState<Notification | null>(null);
  const pendingItemsRef = useRef<string[]>([]);
  const notificationTimerRef = useRef<
    number | null
  >(null);
  const [showSettings, setShowSettings] =
    useState(false);

  // --- Effects ---

  // Update HTML direction based on language
  useEffect(() => {
    document.documentElement.dir =
      lang === Language.HE ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  // Simulate receiving a notification from "User B" (Mock Logic)
  // In a real app, this would be a push notification listener
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
    const t = TRANSLATIONS[lang];

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

  // --- Business Logic ---

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

  const handleShare = () => {
    const url = `${window.location.origin}/#list/${activeListId}`;
    navigator.clipboard.writeText(url);
    alert(`${TRANSLATIONS[lang].copied}\n${url}`);
  };

  // --- Render Helpers ---

  const t = TRANSLATIONS[lang];
  const activeList = lists.find(
    (l) => l.id === activeListId
  );

  // Group Sorting Logic

  // Group Items Logic

  // Catch-all for items with IDs that might have changed or errors

  // --- Login View ---
  if (!user) return <Login />;

  // --- Dashboard View (List Selection) ---
  if (!activeListId) {
    return <ListOfLists />;
  }

  // --- Single List View ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setActiveListId(null)}
            className="p-2 -ml-2 rtl:-mr-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon />
          </button>
          <h1 className="text-lg font-bold text-gray-800 truncate flex-1 text-center mx-2">
            {activeList?.name}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
            >
              <ShareIcon />
            </button>
            <button
              onClick={() =>
                setShowSettings(!showSettings)
              }
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <CogIcon />
            </button>
          </div>
        </div>

        {/* Settings Dropdown (Simulated) */}
        {showSettings && (
          <div className="absolute top-full right-4 rtl:right-auto rtl:left-4 bg-white shadow-xl rounded-xl p-2 w-48 border border-gray-100">
            <div className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">
              {t.settings}
            </div>
            <button className="w-full text-start px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm flex items-center justify-between">
              {t.sort_groups}
              <span className="text-xs bg-gray-100 px-1 rounded">
                Drag
              </span>
            </button>
          </div>
        )}
      </header>
      {/* List Content */}
      <SingleListView />
      {/* Input Area */}
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
              !newItemText.trim() ||
              isCategorizing
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
    </div>
  );
}
