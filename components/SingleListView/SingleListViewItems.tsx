import { CheckIcon } from "@/configuration/icons";
import { ListItem } from "@/types";
import { useSingleListViewMain } from "./hooks/useSingleListViewMain";
interface Props {
  items: ListItem[];
}
export default function SingleListViewItems({
  items,
}: Props) {
  const { toggleItem, user } =
    useSingleListViewMain();
  return (
    <div className="divide-y divide-gray-100 ps-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => toggleItem(item.id)}
          className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
            item.isChecked ? "bg-gray-50/50" : ""
          }`}
        >
          <div
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
        </div>
      ))}
    </div>
  );
}
