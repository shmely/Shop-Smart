import { useContext, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableCategoryItem } from '../../SortableCategoryItem';
import { UserContext } from '@/context/UserContext';
import { Group } from '@/model/types';

interface Props {
  editingGroups: Group[];
  onClose: () => void;
  onSave: () => void;
  onDragEnd: (event: any) => void;
}
export default function SettingsModal({ onClose, onSave, onDragEnd, editingGroups }: Props) {
  const { t } = useContext(UserContext);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      {/* 1. Added max-h-[85vh] to constrain the modal's height */}
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[85vh]">
        {/* 2. Reduced header padding from p-6 to p-4 */}
        <div className="p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">{t.sort_categories}</h3>
          <p className="text-sm text-gray-500 mt-1">{t.drag_and_drop_to_reorder}</p>
        </div>
        {/* 3. The flex-1 and overflow-y-auto will now work correctly within the constrained height */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={editingGroups} strategy={verticalListSortingStrategy}>
              {editingGroups.map((group) => (
                <SortableCategoryItem key={group.id} group={group} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        {/* 4. Reduced footer padding for a denser look */}
        <div className="p-3 bg-gray-100 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={() => onClose()}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-200"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => {
              console.log('Save button clicked!');
              onSave();
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            {t.save_sorting}
          </button>
        </div>
      </div>
    </div>
  );
}
