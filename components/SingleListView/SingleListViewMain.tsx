import { OTHER_USER } from "@/configuration/constants";
import { CheckIcon } from "@/configuration/icons";
import SingleListViewFooter from "./SingleListViewFooter";
import { useSingleListViewMain } from "./useSingleListViewMain";
export default function SingleListViewMain() {
  const { t, groupedItems, toggleItem, user } =
    useSingleListViewMain();

  return (
    <main className="flex-1 p-4 pb-60 overflow-auto">
      {groupedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <span className="text-6xl mb-4">
            🧺
          </span>
          <p>{t.empty_list}</p>
        </div>
      ) : (
        groupedItems.map(({ group, items }) => (
          <div
            key={group.id}
            className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            {/* Group Header */}
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {group.icon}
                </span>
                <span className="font-bold text-gray-700 text-sm">
                  {(t as any)[
                    group.translationKey
                  ] || group.translationKey}
                </span>
              </div>
              <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    toggleItem(item.id)
                  }
                  className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    item.isChecked
                      ? "bg-gray-50/50"
                      : ""
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.isChecked
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {item.isChecked && (
                      <CheckIcon />
                    )}
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
                  {/* Avatar of who added it */}
                  <img
                    src={
                      item.addedBy === user.id
                        ? user.avatarUrl
                        : OTHER_USER.avatarUrl
                    }
                    alt="User"
                    className="w-5 h-5 rounded-full opacity-50"
                    title={
                      item.addedBy === user.id
                        ? "You"
                        : "Other User"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      <SingleListViewFooter />
    </main>
  );
}
