import { ShoppingList, Notification, ListItem, GroupId, User } from '@/model/types';
import { createContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { FirebaseProductCacheService } from '../services/firebaseProductCacheService';
import {
  getDocumentSnapshot,
  getListRef,
  updateListItems,
  createNewList as createNewListInFirebase,
  removeListMember as removeListMemberFromFirebase,
  deleteList as deleteListFromFirebase,
  updateListCustomGroupOrder,
} from '@/data-layer/firebase-layer';
import { STORAGE_KEYS } from '@/configuration/constants';

type ShopSmartContextType = {
  notification: Notification | null;

  lists: ShoppingList[];
  setLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
  setNotification: React.Dispatch<React.SetStateAction<Notification | null>>;
  removeListMember: (listId: string, memberUid: string) => Promise<void>;
  createNewList: (name: string, activeUser: User) => Promise<void>;
  updateItemQuantity: (listId: string, itemToUpdate: ListItem, newQuantity: number) => Promise<void>;
  toggleItem: (listId: string, itemToUpdate: ListItem) => Promise<void>;
  deleteAllDoneItems: (listId: string) => Promise<void>;
  addItemToList: (listId: string, newItem: ListItem) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
  activeListId?: string | null;
  updateActiveList: (id: string | null) => void;
  activeList: ShoppingList | null;
  deleteList: (listId: string) => Promise<void>;
  updateCustomGroupOrder: (customeGroupOrder: {
    [key in GroupId]?: number;
  }) => Promise<void>;
  updateItemCategory: (
    listId: string,
    itemToUpdate: ListItem, // <-- Changed from itemId
    newGroupId: GroupId
  ) => Promise<void>;
};

export const ShopSmartContext = createContext<ShopSmartContextType | undefined>(undefined);
interface ShopSmartProviderProps {
  children: ReactNode;
}

export function ShopSmartProvider({ children }: ShopSmartProviderProps) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(localStorage.getItem(STORAGE_KEYS.ACTIVE_LIST_ID));
  useEffect(() => {
    FirebaseProductCacheService.setActiveList(activeListId);
  }, [activeListId]);

  const createNewList = async (name: string, activeUser: User) => {
    if (!activeUser) throw new Error('User not authenticated');
    await createNewListInFirebase(name, activeUser);
  };

  const updateActiveList = (id: string | null) => {
    setActiveListId(id);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LIST_ID, id);
  };

  const activeList = useMemo(() => {
    if (!activeListId) {
      return null;
    }
    return lists.find((list) => list.id === activeListId) || null;
  }, [lists, activeListId]);

  const updateCustomGroupOrder = async (customerGroupOrder: { [key in GroupId]?: number }) => {
    if (!activeListId) return;
    await updateListCustomGroupOrder(activeListId, customerGroupOrder);
  };

  const removeListMember = async (listId: string, memberUid: string) => {
    await removeListMemberFromFirebase(listId, memberUid);
  };

  const deleteItem = async (listId: string, itemId: string) => {
    const listRef = getListRef(listId);
    const listSnap = await getDocumentSnapshot(listRef);
    if (listSnap.exists()) {
      const remainingItems = listSnap.data().items.filter((item: ListItem) => item.id !== itemId);
      await updateListItems(listRef, remainingItems);
    }
  };

  const deleteList = async (listId: string) => {
    await deleteListFromFirebase(listId);
  };

  const addItemToList = async (listId: string, item: ListItem) => {
    const listRef = getListRef(listId);
    const listSnap = await getDocumentSnapshot(listRef);

    if (listSnap.exists()) {
      // --- Task 1: Add the item to the list's 'items' array ---
      const currentItems = listSnap.data().items || [];
      await updateListItems(listRef, [...currentItems, item]);

      // --- Task 2: Add the product to this list's productCache (This is now the main place) ---
      try {
        // This call saves the product's name and category to the cache for future use.
        await FirebaseProductCacheService.addProduct(item.name, item.groupId);
        console.log(`Product "${item.name}" added to cache for list ${listId}.`);
      } catch (error) {
        console.error('Failed to update product cache:', error);
      }
    }
  };

  const deleteAllDoneItems = async (listId: string) => {
    const listRef = getListRef(listId);
    const listSnap = await getDocumentSnapshot(listRef);
    if (listSnap.exists()) {
      const remainingItems = listSnap.data().items.filter((item: ListItem) => !item.isChecked);
      await updateListItems(listRef, remainingItems);
    }
  };

  const toggleItem = async (listId: string, itemToUpdate: ListItem) => {
    const listRef = getListRef(listId);
    const listSnap = await getDocumentSnapshot(listRef);
    if (listSnap.exists()) {
      const newItems = listSnap
        .data()
        .items.map((item: ListItem) => (item.id === itemToUpdate.id ? { ...item, isChecked: !item.isChecked } : item));
      await updateListItems(listRef, newItems);
    }
  };

  const updateItemCategory = async (listId: string, itemToUpdate: ListItem, newGroupId: GroupId) => {
    // --- Task 1: Update the item's category within the specific list ---
    const listRef = getListRef(listId);
    const listSnap = await getDocumentSnapshot(listRef);

    if (listSnap.exists()) {
      const listData = listSnap.data() as ShoppingList;
      const newItems = listData.items.map((item) =>
        item.id === itemToUpdate.id ? { ...item, groupId: newGroupId } : item
      );
      await updateListItems(listRef, newItems);
    }
    //--- Task 2: Update the global product cache ---
    try {
      const cachedItem = FirebaseProductCacheService.searchSimilar(itemToUpdate.name);
      if (cachedItem && cachedItem.groupId !== newGroupId) {
        await FirebaseProductCacheService.updateProductCategory(cachedItem.id, newGroupId);
      }
    } catch (error) {
      console.error('Failed to update product cache:', error);
    }
  };

  const updateItemQuantity = async (listId: string, itemToUpdate: ListItem, newQuantity: number) => {
    const listRef = getListRef(listId);
    const listSnap = await getDocumentSnapshot(listRef);
    if (listSnap.exists()) {
      const newItems = listSnap
        .data()
        .items.map((item: ListItem) => (item.id === itemToUpdate.id ? { ...item, quantity: newQuantity } : item));
      await updateListItems(listRef, newItems);
    }
  };

  return (
    <ShopSmartContext.Provider
      value={{
        notification,
        setNotification,
        lists,
        setLists,
        activeListId,
        updateActiveList,
        activeList,
        createNewList,
        removeListMember,
        deleteAllDoneItems,
        updateCustomGroupOrder,
        updateItemCategory,
        toggleItem,
        addItemToList,
        deleteList,
        deleteItem,
        updateItemQuantity,
      }}
    >
      {children}
    </ShopSmartContext.Provider>
  );
}
