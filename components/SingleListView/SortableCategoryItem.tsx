import { useContext } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Group } from "@/types";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { TRANSLATIONS } from "@/configuration/constants";
import { UserContext } from "@/context/UserContext";

interface Props {
  group: Group;
}

export function SortableCategoryItem({
  group,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: group.id });
  const { lang } = useContext(UserContext);
  const t = TRANSLATIONS[lang]; // Assuming 'en' for simplicity; replace with actual lang context if needed
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center gap-4 p-3 bg-white border rounded-lg shadow-sm"
    >
      <div
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none p-1"
      >
        <DragIndicatorIcon />
      </div>
      <span className="text-2xl">
        {group.icon}
      </span>
      <span className="font-medium text-gray-700">
        {t[group.translationKey] ||
          group.translationKey}
      </span>
    </div>
  );
}
