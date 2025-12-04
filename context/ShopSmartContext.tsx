import {
  ShoppingList,
  Notification,
  User,
  ListItem,
  GroupId,
} from "@/types";

import {
  createContext,
  useState,
  ReactNode,
} from "react";
import { db } from "../firebase";

import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { FirebaseProductCacheService } from "../services/firebaseProductCacheService";
import {
  getDocumentSnapshot,
  getListRef,
  updateListItems,
} from "@/data-layer/firebase-layer";

type ShopSmartContextType = {
  notification: Notification | null;

  setNotification: React.Dispatch<
    React.SetStateAction<Notification | null>
  >;
  createNewList: (name: string) => Promise<void>;
  removeListMember: (
    listId: string,
    memberUid: string
  ) => Promise<void>;
  updateCustomGroupOrder: (customeGroupOrder: {
    [key in GroupId]?: number;
  }) => Promise<void>;

  deleteList: (listId: string) => Promise<void>;
  updateItemCategory: (
    listId: string,
    itemToUpdate: ListItem, // <-- Changed from itemId
    newGroupId: GroupId
  ) => Promise<void>;
  updateItemQuantity: (
    listId: string,
    itemToUpdate: ListItem,
    newQuantity: number
  ) => Promise<void>;

  toggleItem: (
    listId: string,
    itemToUpdate: ListItem
  ) => Promise<void>;
  deleteAllDoneItems: (
    listId: string
  ) => Promise<void>;
  addItemToList: (
    listId: string,
    newItem: ListItem
  ) => Promise<void>;
  deleteItem: (
    listId: string,
    itemId: string
  ) => Promise<void>;
};

export const ShopSmartContext = createContext<
  ShopSmartContextType | undefined
>(undefined);

interface ShopSmartProviderProps {
  children: ReactNode;
}

export function ShopSmartProvider({
  children,
}: ShopSmartProviderProps) {
  const [user, setUser] = useState<User | null>(
    null
  );

  const createNewList = async (name: string) => {
    if (!user)
      throw new Error("User not authenticated");
    const newList = {
      name,
      ownerId: user.uid,
      members: [user.uid], // Owner is always the first member
      items: [],
    };
    await addDoc(
      collection(db, "shoppingLists"),
      newList
    );
  };

  const updateCustomGroupOrder = async (
    customerGroupOrder: {
      [key in GroupId]?: number;
    },
    activeListId?: string | null
  ) => {
    if (!activeListId) return;

    const listRef = doc(
      db,
      "shoppingLists",
      activeListId
    );
    await updateDoc(listRef, {
      customerGroupOrder,
    });
  };

  const removeListMember = async (
    listId: string,
    memberUid: string
  ) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    await updateDoc(listRef, {
      members: arrayRemove(memberUid),
    });
  };

  const [notification, setNotification] =
    useState<Notification | null>(null);

  const deleteItem = async (
    listId: string,
    itemId: string
  ) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    try {
      // 1. Get the most up-to-date version of the list directly from Firebase
      const listSnap = await getDoc(listRef);
      if (!listSnap.exists()) {
        throw new Error("List not found!");
      }

      const listData =
        listSnap.data() as ShoppingList;

      // 2. Filter the items array to keep only the ones that are NOT checked
      const remainingItems =
        listData.items.filter(
          (item) => item.id !== itemId
        );

      // 3. Update the document in Firebase with the new, filtered array
      await updateDoc(listRef, {
        items: remainingItems,
      });
    } catch (error) {
      console.error(
        "Error deleting done items: ",
        error
      );
    }
  };
  const deleteList = async (listId: string) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    if (!listRef) return;
    await deleteDoc(listRef);
  };

  const addItemToList = async (
    listId: string,
    newItem: ListItem
  ) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    try {
      // Atomically add the new item to the 'items' array in Firestore.
      // arrayUnion is efficient and prevents duplicates if the exact same object is added.
      await updateDoc(listRef, {
        items: arrayUnion(newItem),
      });
    } catch (error) {
      console.error(
        "Error adding item to list: ",
        error
      );
    }
  };

  const deleteAllDoneItems = async (
    listId: string
  ) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    try {
      // 1. Get the most up-to-date version of the list directly from Firebase
      const listSnap = await getDoc(listRef);
      if (!listSnap.exists()) {
        throw new Error("List not found!");
      }

      const listData =
        listSnap.data() as ShoppingList;

      // 2. Filter the items array to keep only the ones that are NOT checked
      const remainingItems =
        listData.items.filter(
          (item) => !item.isChecked
        );

      // 3. Update the document in Firebase with the new, filtered array
      await updateDoc(listRef, {
        items: remainingItems,
      });
    } catch (error) {
      console.error(
        "Error deleting done items: ",
        error
      );
    }
  };
  const toggleItem = async (
    listId: string,
    itemToUpdate: ListItem
  ) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    const listSnap = await getDoc(listRef);
    if (listSnap.exists()) {
      const listData =
        listSnap.data() as ShoppingList;
      const newItems = listData.items.map(
        (item) =>
          item.id === itemToUpdate.id
            ? {
                ...item,
                isChecked: !item.isChecked,
              }
            : item
      );
      await updateDoc(listRef, {
        items: newItems,
      });
    }
  };

  const updateItemCategory = async (
    listId: string,
    itemToUpdate: ListItem,
    newGroupId: GroupId
  ) => {
    // --- Task 1: Update the item's category within the specific list ---
    const listRef = getListRef(listId);
    const listSnap = await getDocumentSnapshot(listRef);

    if (listSnap.exists()) {
      const listData = listSnap.data() as ShoppingList;
      const newItems = listData.items.map((item) =>
        item.id === itemToUpdate.id
          ? { ...item, groupId: newGroupId }
          : item
      );
      await updateListItems(listRef, newItems);
    }

    // --- Task 2: Update the global product cache ---
    try {
      // Use the correct method: searchSimilar()
      const cachedItem = FirebaseProductCacheService.searchSimilar(
        itemToUpdate.name
      );

      if (cachedItem) {
        // If it exists and the group is different, update its category
        if (cachedItem.groupId !== newGroupId) {
          await FirebaseProductCacheService.updateProductCategory(
            cachedItem.id,
            newGroupId
          );
        }
      } else {
        // If it's a new item not in the cache, add it using the correct method: addProduct()
        await FirebaseProductCacheService.addProduct(
          itemToUpdate.name,
          newGroupId
        );
      }
    } catch (error) {
      console.error("Failed to update product cache:", error);
    }
  };

  const updateItemQuantity = async (
    listId: string,
    itemToUpdate: ListItem,
    newQuantity: number
  ) => {
    // --- Task 1: Update the item's quantity within the specific list ---
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    const listSnap = await getDoc(listRef);
    if (listSnap.exists()) {
      const listData =
        listSnap.data() as ShoppingList;
      const newItems = listData.items.map(
        (item) =>
          item.id === itemToUpdate.id
            ? { ...item, quantity: newQuantity }
            : item
      );
      await updateDoc(listRef, {
        items: newItems,
      });
    }
  };

  return (
    <ShopSmartContext.Provider
      value={{
        notification,
        setNotification,
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
