import { ShopSmartContext } from "@/context/ShopSmartContext/ShopSmartContext";
import { Group, GroupId } from "@/model/types";
import { arrayMove } from "@dnd-kit/sortable";
import { useContext, useState } from "react";

export function useSettingsModal() {
    const { updateCustomGroupOrder, sortedGroups } = useContext(ShopSmartContext);
    const [editingGroups, setEditingGroups] = useState<Group[]>(sortedGroups);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const handleSaveOrder = async () => {
        const newOrderMap = editingGroups.reduce((acc, group, index) => {
            acc[group.id] = index;
            return acc;
        }, {} as { [key in GroupId]?: number });

        // This call now triggers the logic we added in ShopSmartContext
        await updateCustomGroupOrder(newOrderMap);
        setIsSettingsModalOpen(false);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = editingGroups.findIndex((item) => item.id === active.id);
            const newIndex = editingGroups.findIndex((item) => item.id === over.id);
            setEditingGroups(arrayMove(editingGroups, oldIndex, newIndex));
        }
    };

    const handleOpenSettings = () => {
        setEditingGroups(sortedGroups);
        setIsSettingsModalOpen(true);
    };

    const handleCloseSettings = () => {
        setIsSettingsModalOpen(false);
    };

    return {
        isSettingsModalOpen,
        editingGroups,
        handleOpenSettings,
        handleSaveOrder,
        handleDragEnd,
        setIsSettingsModalOpen,
        handleCloseSettings
    };
}

