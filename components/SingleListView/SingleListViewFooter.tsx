import { PlusIcon } from "@/configuration/icons";
import { useFooterLogic } from "./useFooterLogic";

export default function SingleListViewFooter() {
  const {
    t,
    newItemText,
    setNewItemText,
    isCategorizing,
    handleAddItem,
  } = useFooterLogic();
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
