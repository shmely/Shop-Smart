import SingleListViewFooter from './SingleListViewFooter';
import { useSingleListViewMain } from './hooks/useSingleListViewMain';
import SingleListViewGroupHeader from './SingleListViewGroupHeader';
import SingleListViewItems from './SingleListViewItems';
import { ChevronDownIcon, ChevronUpIcon } from '@/configuration/icons';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import SingleListViewHeader from './SingleListViewHeader';
import SettingsModal from './modal/settings-modal/SettingsModal';
import { useContext, useState } from 'react';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';
import { useSettingsModal } from './modal/settings-modal/useSettingsModal';
import ConfirmDeleteModal from './modal/ConfirmDeleteModal';

export default function SingleListViewMain() {
  const { t, groupedItems, collapsedDoneItems, setCollapsedDoneItems, doneGroups, doneItemsCount } =
    useSingleListViewMain();
  const { deleteAllDoneItems, activeListId } = useContext(ShopSmartContext);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const {
    isSettingsModalOpen,
    handleOpenSettings,
    editingGroups,
    handleCloseSettings,
    handleSaveOrder,
    handleDragEnd,
  } = useSettingsModal();

  const handleConfirmDelete = () => {
    if (activeListId) {
      deleteAllDoneItems(activeListId);
    }
    setIsDeleteConfirmOpen(false); // Close the modal after deleting
  };

  return (
    <>
      <SingleListViewHeader onOpenSettings={handleOpenSettings} />
      <main className="flex-1 p-4 pb-60 overflow-auto">
        {groupedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-6xl mb-4">🧺</span>
            <p>{t.empty_list}</p>
          </div>
        ) : (
          groupedItems
            .filter(({ items }) => items.some((item) => !item.isChecked))
            .map(({ group, items }) => (
              <div key={group.id} className="mb-2 bg-white rounded-2xl shadow-sm border border-gray-100">
                <SingleListViewGroupHeader group={group} itemsCount={items.length} />

                <SingleListViewItems items={items.filter((item) => !item.isChecked)} listId={activeListId} />
              </div>
            ))
        )}
        {doneItemsCount > 0 && (
          <>
            <div className="flex flex-col items-center border-t border-gray-400 my-6 px-4">
              <span className="text-gray-700 text-xl ">{t.done_items}</span>
              <div className="flex text-gray-500 justify-between align-center w-full ">
                <button
                   onClick={() => setIsDeleteConfirmOpen(true)}
                  className="text-gray-600 hover:text-red-500 transition-colors"
                >
                  <DeleteSweepOutlinedIcon fontSize="large" />
                </button>

                <span className="font text-me mx-auto">
                  {doneItemsCount === 1
                    ? `${t.item} ${t.one}`
                    : doneItemsCount > 1
                    ? `${doneItemsCount} ${t.items}`
                    : ''}
                </span>
                {doneItemsCount > 0 && (
                  <div className="flex">
                    {collapsedDoneItems ? (
                      <button
                        type="button"
                        onClick={() => setCollapsedDoneItems(!collapsedDoneItems)}
                        className="focus:outline-none"
                      >
                        <ChevronUpIcon />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCollapsedDoneItems(!collapsedDoneItems)}
                        className="focus:outline-none"
                      >
                        <ChevronDownIcon />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {!collapsedDoneItems &&
              groupedItems
                .filter(({ items }) => items.some((item) => item.isChecked))
                .map(({ group, items }) => (
                  <div key={group.id} className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <SingleListViewGroupHeader group={group} itemsCount={items.length} />

                    <SingleListViewItems listId={activeListId} items={items.filter((item) => item.isChecked)} />
                  </div>
                ))}
          </>
        )}
        <SingleListViewFooter />
      </main>
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={handleCloseSettings}
          onSave={handleSaveOrder}
          onDragEnd={handleDragEnd}
          editingGroups={editingGroups}
        />
      )}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t.delete_done_items_title}
        message={t.confirm_delete_done_items}
      />
    </>
  );
}
