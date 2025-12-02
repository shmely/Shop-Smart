import {
  Group,
  GroupId,
  ListItem,
} from "@/types";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { TRANSLATIONS } from "@/configuration/constants";
import { useContext } from "react";

interface Props {
  listId: string;
  item: ListItem;
  groups: Group[];
  onClose: () => void;
  onSave: (
    listId: string,
    itemToUpdate: ListItem,
    newGroupId: GroupId
  ) => void;
}

export default function EditCategoryModal({
  listId,
  item,
  groups,
  onClose,
  onSave,
}: Props) {
  const { lang } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];

  const handleSave = (newGroupId: GroupId) => {
    onSave(listId, item, newGroupId);
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            {t.changeCategory}{" "}
            <span className="text-emerald-600">
              {item.name}
            </span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Select a new category for this item.
          </p>
        </div>
        <div className="p-2 max-h-60 overflow-y-auto">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleSave(group.id)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-emerald-50 transition-colors ${
                item.groupId === group.id
                  ? "bg-emerald-100 font-bold"
                  : ""
              }`}
            >
              <span className="text-xl">
                {group.icon}
              </span>
              <span>
                {t[group.translationKey] ||
                  group.translationKey}
              </span>
            </button>
          ))}
        </div>
        <div className="p-4 bg-gray-50 rounded-b-2xl text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
