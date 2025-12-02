import {
  CheckIcon,
  EditIcon,
} from "@/configuration/icons";
import { ListItem } from "@/types";
import { QuantityInput } from "./QuantityInput";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

interface Props {
  listId: string;
  item: ListItem;
  updateItemQuantity: (
    listId: string,
    itemToUpdate: ListItem,
    newQuantity: number
  ) => Promise<void>;
  toggleItem: (
    listId: string,
    itemToUpdate: ListItem
  ) => void;
  setEditingItem: (item: ListItem | null) => void;
  deleteItem: (
    listId: string,
    itemId: string
  ) => void;
}

export function ViewItem({
  listId,
  item,
  updateItemQuantity,
  toggleItem,
  setEditingItem,
  deleteItem,
}: Props) {
  return (
    <div
      key={item.id}
      className={`p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
        item.isChecked ? "bg-gray-50/50" : ""
      }`}
    >
      <div
        onClick={() => toggleItem(listId, item)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          item.isChecked
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-gray-300"
        }`}
      >
        {item.isChecked && <CheckIcon />}
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
      {!item.isChecked && (
        <QuantityInput
          updateItemQuantity={updateItemQuantity}
          item={item}
          listId={listId}
        />
      )}
      <button
        onClick={() => setEditingItem(item)}
        className="text-gray-400 hover:text-emerald-600 p-1 rounded-full"
        title={`Edit category for ${item.name}`}
      >
        <EditIcon />
      </button>
      <button
        title={`Delete ${item.name}`}
        onClick={() =>
          deleteItem(listId, item.id)
        }
        className="text-gray-600 hover:text-red-500 transition-colors"
      >
        <DeleteOutlinedIcon />
      </button>
    </div>
  );
}
