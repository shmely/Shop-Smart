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
}
export default function SingleListViewItems({
  items,
  listId,
}: Props) {
  return (
    <div className="divide-y  divide-gray-100 ps-6">
      {items.map((item) => (
        <ViewItem
          key={item.id}
          item={item}
          listId={listId}
        />
      ))}
    </div>
  );
}
