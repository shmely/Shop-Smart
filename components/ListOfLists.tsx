import { TRANSLATIONS } from '@/configuration/constants';
import { PlusIcon } from '@/configuration/icons';
import { ShopSmartContext } from '@/context/ShopSmartContext';
import { UserContext } from '@/context/UserContext';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useContext, useState } from 'react';

export default function ListOfLists() {
  const { user, t } = useContext(UserContext);
  const { createNewList, deleteList, updateActiveList, lists } = useContext(ShopSmartContext);

  const [showCreateList, setShowCreateList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const handleCreateList = () => {
    if (!newListName.trim() || !user) return;
    createNewList(newListName.trim(), user);
    setShowCreateList(false);
    setNewListName('');
  };

  const handleDeleteList = (listId: string) => {
    deleteList(listId);
    updateActiveList('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-60 overflow-auto">
      <main className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{t.my_lists}</h3>
        <div className="grid gap-4">
          {lists.map((list) => (
            <div className="w-full flex" key={list.id}>
              <div className="bg-white w-full p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
                <button className="flex items-center justify-between w-full" onClick={() => updateActiveList(list.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
                      {list.name.toLocaleLowerCase().includes('grocery') || list.name.toLocaleLowerCase().includes('סופר') ? '🛒' : '⛺'}
                    </div>
                    <div className="text-start">
                      <h4 className="font-bold text-gray-800">{list.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {list.items.filter((i) => !i.isChecked).length} items •{' '}
                        {list.members.length > 0 ? t.shared_with + ' ' + list.members.length : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-gray-300 rtl:rotate-180">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
                {user && list && user.uid === list.ownerId && (
                  <button onClick={() => handleDeleteList(list.id)} className="mr-2 p-2  ml-2 hover:bg-gray-100 transition">
                    <DeleteOutlinedIcon className="text-gray-500 hover:text-red-500 transition-colors " />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FAB to create list */}
      <button
        onClick={() => setShowCreateList(true)}
        className="fixed bottom-6 right-6 rtl:right-auto rtl:left-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition"
      >
        <PlusIcon />
      </button>

      {/* Create List Modal */}
      {showCreateList && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs">
            <h3 className="text-lg font-bold mb-4">{t.create_list}</h3>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={t.list_name_placeholder}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateList(false)} className="px-4 py-2 text-gray-500 font-medium">
                {t.cancel}
              </button>
              <button onClick={handleCreateList} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium">
                {t.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
