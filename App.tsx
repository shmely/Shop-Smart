import React, {
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import {
  Language,
  ShoppingList,
  User,
  ListItem,
  Group,
  GroupId,
  Notification,
} from "./types";
import {
  DEFAULT_GROUPS,
  TRANSLATIONS,
  OTHER_USER,
} from "./constants";
import { categorizeItem } from "./services/geminiService";
import { NotificationToast } from "./components/NotificationToast";
import Login from "./components/Login";
import { ShopSmartContext } from "./context/ShopSmartContext";
import ListOfLists from "./components/ListOfLists";

// --- Icons ---
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.345 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
    />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6 rtl:rotate-180"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 018.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.42 24.42 0 00-9.094 2.075m9.094-2.075a24.42 24.42 0 01-9.094-2.075m9.42 9.305c-.609.336-1.274.514-1.954.514a3.66 3.66 0 01-1.954-.514m0 0a24.45 24.45 0 00-7.336 1.433m7.336-1.433a24.45 24.45 0 01-7.336-1.433M2.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V6a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 002.25 6z"
    />
  </svg>
);

// --- Main App Component ---
export default function App() {
  // --- State ---
  const {
    lang,
    setLang,
    user,
    lists,
    setLists,
    activeListId,
    setActiveListId,
  } = useContext(ShopSmartContext);

  const [newListName, setNewListName] =
    useState("");
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
  const [showCreateList, setShowCreateList] =
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

  const handleCreateList = () => {
    if (!newListName.trim() || !user) return;
    const newList: ShoppingList = {
      id: `list_${Date.now()}`,
      name: newListName,
      ownerId: user.id,
      sharedWith: [],
      items: [],
    };
    setLists([...lists, newList]);
    setActiveListId(newList.id);
    setShowCreateList(false);
    setNewListName("");
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

  const toggleItem = (itemId: string) => {
    setLists((prev) =>
      prev.map((list) => {
        if (list.id === activeListId) {
          const updatedItems = list.items.map(
            (item) =>
              item.id === itemId
                ? {
                    ...item,
                    isChecked: !item.isChecked,
                  }
                : item
          );
          return { ...list, items: updatedItems };
        }
        return list;
      })
    );
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
  const sortedGroups = [...DEFAULT_GROUPS].sort(
    (a, b) => {
      // If custom order exists for this list, use it, else default
      const orderA =
        activeList?.customGroupOrder?.[a.id] ??
        a.order;
      const orderB =
        activeList?.customGroupOrder?.[b.id] ??
        b.order;
      return orderA - orderB;
    }
  );

  // Group Items Logic
  const groupedItems = activeList
    ? sortedGroups
        .map((group) => {
          const itemsInGroup =
            activeList.items.filter(
              (i) => i.groupId === group.id
            );
          return {
            group,
            items: itemsInGroup,
          };
        })
        .filter((g) => g.items.length > 0)
    : [];

  // Catch-all for items with IDs that might have changed or errors
  const otherItems = activeList
    ? activeList.items.filter(
        (i) =>
          !sortedGroups.find(
            (g) => g.id === i.groupId
          )
      )
    : [];
  if (otherItems.length > 0 && activeList) {
    groupedItems.push({
      group: DEFAULT_GROUPS.find(
        (g) => g.id === GroupId.OTHER
      )!,
      items: otherItems,
    });
  }

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
      <main className="flex-1 p-4 overflow-y-auto pb-32">
        {groupedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-6xl mb-4">
              🧺
            </span>
            <p>{t.empty_list}</p>
          </div>
        ) : (
          groupedItems.map(({ group, items }) => (
            <div
              key={group.id}
              className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {group.icon}
                  </span>
                  <span className="font-bold text-gray-700 text-sm">
                    {(t as any)[
                      group.translationKey
                    ] || group.translationKey}
                  </span>
                </div>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      toggleItem(item.id)
                    }
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      item.isChecked
                        ? "bg-gray-50/50"
                        : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.isChecked
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {item.isChecked && (
                        <CheckIcon />
                      )}
                    </div>
                    <span
                      className={`flex-1 text-base ${
                        item.isChecked
                          ? "text-gray-400 line-through decoration-emerald-500/40"
                          : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </span>
                    {/* Avatar of who added it */}
                    <img
                      src={
                        item.addedBy === user.id
                          ? user.avatarUrl
                          : OTHER_USER.avatarUrl
                      }
                      alt="User"
                      className="w-5 h-5 rounded-full opacity-50"
                      title={
                        item.addedBy === user.id
                          ? "You"
                          : "Other User"
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>

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
