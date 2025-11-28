import SingleListViewFooter from "./SingleListViewFooter";
import { useSingleListViewMain } from "./hooks/useSingleListViewMain";
import SingleListViewGroupHeader from "./SingleListViewGroupHeader";
import SingleListViewItems from "./SingleListViewItems";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/configuration/icons";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import { DEFAULT_GROUPS } from "@/configuration/constants";
import EditCategoryModal from "./EditCategoryModal";
export default function SingleListViewMain() {
  const {
    t,
    groupedItems,
    activeList,
    collapsedDoneItems,
    setCollapsedDoneItems,
    deleteAllDoneItems,
    editingItem,
    setEditingItem,
    updateItemGroup,
  } = useSingleListViewMain();
  const doneGroups = groupedItems.filter(
    ({ items }) =>
      items.some((item) => item.isChecked)
  );
  const doneItemsCount = doneGroups.reduce(
    (acc, group) =>
      acc +
      group.items.filter((item) => item.isChecked)
        .length,
    0
  );

  return (
    <>
      <main className="flex-1 p-4 pb-60 overflow-auto">
        <div className="flex items-center  border-t border-gray-400 my-6">
          <span className="font-bold text-gray-700 text-xl mx-auto mt-4 mb-2">
            {activeList?.name}
          </span>
        </div>
        {groupedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <span className="text-6xl mb-4">
              🧺
            </span>
            <p>{t.empty_list}</p>
          </div>
        ) : (
          groupedItems
            .filter(({ items }) =>
              items.some(
                (item) => !item.isChecked
              )
            )
            .map(({ group, items }) => (
              <div
                key={group.id}
                className="mb-2 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <SingleListViewGroupHeader
                  group={group}
                  itemsCount={items.length}
                />

                {/* Items to buy */}
                <SingleListViewItems
                  items={items.filter(
                    (item) => !item.isChecked
                  )}
                />
              </div>
            ))
        )}
        <div className="flex flex-col items-center border-t border-gray-400 my-6 px-4">
          <span className="text-gray-700 text-xl ">
            {t.done_items}
          </span>
          <div className="flex text-gray-500 justify-between align-center w-full ">
            <button
              onClick={deleteAllDoneItems}
              className="text-gray-600 hover:text-red-500 transition-colors"
            >
              <DeleteSweepOutlinedIcon fontSize="large" />
            </button>

            <span className="font text-me mx-auto">
              {doneItemsCount === 1
                ? `${t.item} ${t.one}`
                : doneItemsCount > 1
                ? `${doneItemsCount} ${t.items}`
                : ""}
            </span>
            {doneItemsCount > 0 && (
              <div className="flex">
                {collapsedDoneItems ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedDoneItems(
                        !collapsedDoneItems
                      )
                    }
                    className="focus:outline-none"
                  >
                    <ChevronUpIcon />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setCollapsedDoneItems(
                        !collapsedDoneItems
                      )
                    }
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
            .filter(({ items }) =>
              items.some((item) => item.isChecked)
            )
            .map(({ group, items }) => (
              <div
                key={group.id}
                className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <SingleListViewGroupHeader
                  group={group}
                  itemsCount={items.length}
                />

                <SingleListViewItems
                  items={items.filter(
                    (item) => item.isChecked
                  )}
                />
              </div>
            ))}
        <SingleListViewFooter />
      </main>
      {/* Render the modal when an item is being edited */}
      {editingItem && (
        <EditCategoryModal
          item={editingItem}
          groups={DEFAULT_GROUPS}
          onClose={() => setEditingItem(null)}
          onSave={updateItemGroup}
        />
      )}
    </>
  );
}
