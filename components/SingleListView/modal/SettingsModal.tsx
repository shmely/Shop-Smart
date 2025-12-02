import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor, // 1. Import the TouchSensor
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Group } from "@/types";
import { SortableCategoryItem } from "../SortableCategoryItem";
import { TRANSLATIONS } from "@/configuration/constants";
import { ShopSmartContext } from "@/context/ShopSmartContext";

interface Props {
  groups: Group[];
  onClose: () => void;
  onSave: (reorderedGroups: Group[]) => void;
  onReorder: (reorderedGroups: Group[]) => void;
}

export default function SettingsModal({
  groups,
  onClose,
  onReorder,
  onSave,
}: Props) {
 

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter:
        sortableKeyboardCoordinates,
    })
  );
  const { lang } = useContext(ShopSmartContext);
  const t = TRANSLATIONS[lang];

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = groups.findIndex((item) => item.id === active.id);
      const newIndex = groups.findIndex((item) => item.id === over.id);
      // Call the new onReorder prop to update the parent's state immediately
      onReorder(arrayMove(groups, oldIndex, newIndex));
    }
  }

  const handleSave = () => {
    onSave(groups);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      {/* 1. Added max-h-[85vh] to constrain the modal's height */}
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">
        {/* 2. Reduced header padding from p-6 to p-4 */}
        <div className="p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">
            {t.sort_categories}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t.drag_and_drop_to_reorder}
          </p>
        </div>
        {/* 3. The flex-1 and overflow-y-auto will now work correctly within the constrained height */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={groups}
              strategy={
                verticalListSortingStrategy
              }
            >
              {groups.map((group) => (
                <SortableCategoryItem
                  key={group.id}
                  group={group}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        {/* 4. Reduced footer padding for a denser look */}
        <div className="p-3 bg-gray-100 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-200"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => handleSave()}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            {t.save_sorting}
          </button>
        </div>
      </div>
    </div>
  );
}
