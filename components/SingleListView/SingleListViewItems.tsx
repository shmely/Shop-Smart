import {
  CheckIcon,
  EditIcon,
} from "@/configuration/icons";
import { ListItem } from "@/types";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { QuantityInput } from "./QuantityInput";
import { ViewItem } from "./ViewItem";

interface Props {
  listId: string;
  items: ListItem[];
  toggleItem: (listId: string, itemToUpdate: ListItem) => void;
updateItemQuantity: (
    listId: string,
    itemToUpdate: ListItem,
    newQuantity: number
  ) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => void;
  setEditingItem: (item: ListItem | null) => void;
}
export default function SingleListViewItems({
  items,
  listId,
  toggleItem,
  updateItemQuantity,
  deleteItem,
  setEditingItem,
}: Props) {
  return (
    <div className="divide-y  divide-gray-100 ps-6">
      {items.map((item) => (
        <ViewItem
          key={item.id}
          item={item}
          listId={listId}
          updateItemQuantity={updateItemQuantity}
          toggleItem={toggleItem}
          setEditingItem={setEditingItem}
          deleteItem={deleteItem}
        />
      ))}
    </div>
  );
}
