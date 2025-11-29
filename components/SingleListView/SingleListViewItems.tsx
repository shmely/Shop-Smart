import {
  CheckIcon,
  EditIcon,
} from "@/configuration/icons";
import { ListItem } from "@/types";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { QuantityInput } from "./QuantityInput";
import { ViewItem } from "./ViewItem";

interface Props {
  items: ListItem[];
  toggleItem: (itemId: string) => void;
  updateItemQuantity: (
    itemId: string,
    quantity: number
  ) => void;
  deleteItem: (itemId: string) => void;
  setEditingItem: (item: ListItem | null) => void;
}
export default function SingleListViewItems({
  items,
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
          updateItemQuantity={updateItemQuantity}
          toggleItem={toggleItem}
          setEditingItem={setEditingItem}
          deleteItem={deleteItem}
        />
      ))}
    </div>
  );
}
