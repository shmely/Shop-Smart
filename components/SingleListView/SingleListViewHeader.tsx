import {
  ArrowLeftIcon,
  CogIcon,
  ShareIcon,
} from "@/configuration/icons";
import { useSingleListViewHeader } from "./useSingleListViewHeader";

export default function SingleListViewHeader() {
  const {
    activeList,
    t,
    setActiveListId,
    showSettings,
    setShowSettings,
    handleShare,
  } = useSingleListViewHeader();
  return (
    <header className="bg-white shadow-sm top-0 z-10 relative">
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
  );
}
