import SingleListViewFooter from "./SingleListViewFooter";
import { useSingleListViewMain } from "./hooks/useSingleListViewMain";
import SingleListViewGroupHeader from "./SingleListViewGroupHeader";
import SingleListViewItems from "./SingleListViewItems";
export default function SingleListViewMain() {
  const { t, groupedItems  } =
    useSingleListViewMain();

  return (
    <main className="flex-1 p-4 pb-60 overflow-auto">
      <div className="flex items-center  border-t border-gray-400 my-6">
        <span className="font-bold underline text-gray-700 text-xl mx-auto mt-4 mb-2">
          לרכוש
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
            items.some((item) => !item.isChecked)
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

              {/* Items to buy */}
              <SingleListViewItems items={items.filter((item) => !item.isChecked)} />
            </div>
          ))
      )}
      <div className="flex items-center border-t border-gray-400 my-6">
        <span className="font-bold underline text-gray-700 text-xl mx-auto mt-4 mb-2">
          נרכש
        </span>
      </div>
      {groupedItems
        .filter(({ items }) =>
          items.some((item) => item.isChecked)
        )
        .map(({ group, items }) => (
          <div
            key={group.id}
            className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            {/* Group Header */}
            <SingleListViewGroupHeader
              group={group}
              itemsCount={items.length}
            />

            {/* Items */}
            <SingleListViewItems items={items.filter((item) => item.isChecked)} />
          </div>
        ))}
      <SingleListViewFooter />
    </main>
  );
}
