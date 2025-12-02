import {
  ArrowLeftIcon,
  ShareIcon,
} from "@/configuration/icons";
import SettingsIcon from "@mui/icons-material/Settings";
import { useSingleListViewHeader } from "./hooks/useSingleListViewHeader";
import { useState } from "react";
import ShareListModal from "./modal/ShareListModal";

interface Props {
  onOpenSettings: () => void; // Add this prop
}

export default function SingleListViewHeader({
  onOpenSettings,
}: Props) {
  const { activeList, setActiveListId } =
    useSingleListViewHeader();
  const [shareList, setShareList] =
    useState<boolean>(false);
  return (
    <header className="bg-white shadow-sm top-0 z-10 relative">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => setActiveListId("")}
          className="p-2 -ml-2 rtl:-mr-2 text-gray-600 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="text-lg font-bold text-gray-800 truncate flex-1 text-center mx-2">
          {activeList?.name}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShareList(true)}
            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
          >
            <ShareIcon />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <SettingsIcon />
          </button>
        </div>
      </div>
      {shareList && (
        <ShareListModal
          setIsOpen={setShareList}
        />
      )}
    </header>
  );
}
