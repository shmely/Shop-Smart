import { TRANSLATIONS } from "@/constants";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { Language } from "@/types";
import { useContext } from "react";

export default function ListOfLists() {
  const {
    lists,
    user,
    setLang,
    lang,
    setActiveListId,
    activeListId,
  } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];
  // Placeholder for active list state
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img
            src={user.avatarUrl}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-emerald-500"
          />
          <div>
            <h2 className="font-bold text-gray-800 text-lg">
              {t.welcome},{" "}
              {user.name.split(" ")[0]}
            </h2>
          </div>
        </div>
        <button
          onClick={() =>
            setLang(
              lang === Language.HE
                ? Language.EN
                : Language.HE
            )
          }
          className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full"
        >
          {lang === Language.HE ? "EN" : "עב"}
        </button>
      </header>

      <main className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {t.my_lists}
        </h3>
        <div className="grid gap-4">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() =>
                setActiveListId(list.id)
              }
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                  {list.id.includes("grocery")
                    ? "🛒"
                    : "⛺"}
                </div>
                <div className="text-start">
                  <h4 className="font-bold text-gray-800">
                    {list.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {
                      list.items.filter(
                        (i) => !i.isChecked
                      ).length
                    }{" "}
                    items •{" "}
                    {list.sharedWith.length > 0
                      ? t.shared_with +
                        " " +
                        list.sharedWith.length
                      : ""}
                  </p>
                </div>
              </div>
              <div className="text-gray-300 rtl:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* FAB to create list */}
      <button
        onClick={() => setShowCreateList(true)}
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition"
      >
        <PlusIcon />
      </button>

      {/* Create List Modal */}
      {showCreateList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4">
              {t.create_list}
            </h3>
            <input
              type="text"
              value={newListName}
              onChange={(e) =>
                setNewListName(e.target.value)
              }
              placeholder={
                t.list_name_placeholder
              }
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() =>
                  setShowCreateList(false)
                }
                className="px-4 py-2 text-gray-500 font-medium"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateList}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium"
              >
                {t.create}
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationToast
        notification={notification}
        onDismiss={() => setNotification(null)}
      />
    </div>
  );
}
