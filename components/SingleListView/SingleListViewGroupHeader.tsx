import { Group, ListItem } from "@/types";
import { TRANSLATIONS } from "@/configuration/constants";
import { useContext } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { UserContext } from "@/context/UserContext";

interface Props {
  group: Group;
  itemsCount: number;
}
export default function SingleListViewGroupHeader({ group, itemsCount }: Props) {
  const { lang } = useContext(UserContext);
  const t = TRANSLATIONS[lang];
  return (
    <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-xl">
          {group.icon}
        </span>
        <span className="font-bold text-gray-700 text-sm">
          {t[group.translationKey] ||
            group.translationKey}
        </span>
      </div>
      <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
        {itemsCount}
      </span>
    </div>
  );
}
