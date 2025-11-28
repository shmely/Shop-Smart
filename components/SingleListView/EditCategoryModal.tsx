import { Group, GroupId, ListItem } from "@/types";

interface Props {
  item: ListItem;
  groups: Group[];
  onClose: () => void;
  onSave: (itemId: string, newGroupId: GroupId) => void;
}

export default function EditCategoryModal({
  item,
  groups,
  onClose,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-800">
            Change Category for <span className="text-emerald-600">{item.name}</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1">Select a new category for this item.</p>
        </div>
        <div className="p-2 max-h-60 overflow-y-auto">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSave(item.id, group.id)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-emerald-50 transition-colors ${
                item.groupId === group.id ? "bg-emerald-100 font-bold" : ""
              }`}
            >
              <span className="text-xl">{group.icon}</span>
              <span>{group.translationKey}</span>
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