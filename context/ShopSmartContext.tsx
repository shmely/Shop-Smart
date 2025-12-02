import { useMemo } from "react";
import {
  Language,
  ShoppingList,
  Notification,
  User,
  ListItem,
  GroupId,
} from "@/types";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { FirebaseProductCacheService } from "../services/firebaseProductCacheService";

type ShopSmartContextType = {
  user: User | null;
  lang: Language;
  lists: ShoppingList[];
  activeListId?: string | null;
  activeList: ShoppingList | null;
  notification: Notification | null;
  isAuthLoading: boolean;
  setUser: React.Dispatch<
    React.SetStateAction<User | null>
  >;
  setLang: React.Dispatch<
    React.SetStateAction<Language>
  >;
  setLists: React.Dispatch<
    React.SetStateAction<ShoppingList[]>
  >;
  setActiveListId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  setNotification: React.Dispatch<
    React.SetStateAction<Notification | null>
  >;
  createNewList: (name: string) => Promise<void>;
  removeListMember: (
    listId: string,
    memberUid: string
  ) => Promise<void>;
  addListMemberByEmail: (
    email: string
  ) => Promise<{
    subject: string;
    body: string;
  } | null>;
  updateCustomerGroupOrder: (customerGroupOrder: {
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

const STORAGE_KEYS = {
  LISTS: "shop-smart-lists",
  USER: "shop-smart-user",
  ACTIVE_LIST_ID: "shop-smart-active-list-id",
  LANGUAGE: "shop-smart-language",
};

export function ShopSmartProvider({
  children,
}: ShopSmartProviderProps) {
  const [user, setUser] = useState<User | null>(
    null
  );

  const [lists, setLists] = useState<
    ShoppingList[]
  >([]);

  useEffect(() => {
    // This listener runs once on load, and again whenever the user logs in or out.
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setIsAuthLoading(true);
        if (firebaseUser) {
          // User is signed in.
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email
              ? firebaseUser.email.toLowerCase()
              : null,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setUser(userData);
          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );
          await setDoc(
            userRef,
            {
              email: firebaseUser.email
                ? firebaseUser.email.toLowerCase()
                : null,
              displayName:
                firebaseUser.displayName,
            },
            { merge: true }
          );

          // --- HANDLE PENDING INVITATION ---
          const pendingListId =
            sessionStorage.getItem(
              "pendingInvitation"
            );
          const userEmail =
            firebaseUser.email?.toLowerCase();

          if (pendingListId && userEmail) {
            const listRef = doc(
              db,
              "shoppingLists",
              pendingListId
            );

            // Add the new user's UID to the members array
            // AND remove their email from pendingInvites in one atomic operation
            await updateDoc(listRef, {
              members: arrayUnion(
                firebaseUser.uid
              ),
              pendingInvites:
                arrayRemove(userEmail),
            });

            // Clear the stored invitation
            sessionStorage.removeItem(
              "pendingInvitation"
            );

            // Set this as the active list for a great UX!
            setActiveListId(pendingListId);
          }
        } else {
          // User is signed out.
          setUser(null);
          setLists([]); // Clear lists on logout
        }
        // 3. Once we have a definitive answer, set loading to false.
        setIsAuthLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) return; // Don't query if there's no user

    setIsAuthLoading(true);
    const listsRef = collection(
      db,
      "shoppingLists"
    );
    // This query is the core of your security model:
    // It only fetches lists where the current user's UID is in the 'members' array.
    const q = query(
      listsRef,
      where("members", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const userLists: ShoppingList[] = [];
        querySnapshot.forEach((doc) => {
          userLists.push({
            id: doc.id,
            ...doc.data(),
          } as ShoppingList);
        });
        setLists(userLists);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount or user change
  }, [user]);

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

  const updateCustomerGroupOrder =
    async (customerGroupOrder: {
      [key in GroupId]?: number;
    }) => {
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

  const [activeListId, setActiveListId] =
    useState<string | null>("");

  const [lang, setLang] = useState<Language>(
    () => {
      try {
        const savedLang = localStorage.getItem(
          STORAGE_KEYS.LANGUAGE
        );
        return savedLang
          ? JSON.parse(savedLang)
          : Language.HE;
      } catch (error) {
        console.error(
          "Error loading language from localStorage:",
          error
        );
        return Language.HE;
      }
    }
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.LANGUAGE,
        JSON.stringify(lang)
      );
    } catch (error) {
      console.error(
        "Error saving language to localStorage:",
        error
      );
    }
  }, [lang]);

  useEffect(() => {
    try {
      if (activeListId) {
        localStorage.setItem(
          STORAGE_KEYS.ACTIVE_LIST_ID,
          activeListId
        );
      } else {
        // Also remove it from storage if it becomes null
        localStorage.removeItem(
          STORAGE_KEYS.ACTIVE_LIST_ID
        );
      }
    } catch (error) {
      console.error(
        "Error saving active list ID to localStorage:",
        error
      );
    }
  }, [activeListId]);

  const activeList = useMemo(() => {
    if (!activeListId) {
      return null;
    }
    return (
      lists.find(
        (list) => list.id === activeListId
      ) || null
    );
  }, [lists, activeListId]);

  const addListMemberByEmail = async (
    email: string
  ): Promise<{
    subject: string;
    body: string;
  } | null> => {
    if (!activeListId || !activeList) {
      throw new Error("No active list selected.");
    }
    const normalizedEmail = email
      .toLowerCase()
      .trim();
    const listRef = doc(
      db,
      "shoppingLists",
      activeListId
    );

    // Check if a user with this email already exists
    const userQuery = query(
      collection(db, "users"),
      where("email", "==", normalizedEmail)
    );
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      // --- CASE 1: User Exists ---
      const memberUid = userSnapshot.docs[0].id;

      // Check if they are already a full member
      if (
        activeList.members.includes(memberUid)
      ) {
        throw new Error(
          "This user is already a member of the list."
        );
      }

      // User exists but is not a member. Add them and clean up any pending invite.
      await updateDoc(listRef, {
        members: arrayUnion(memberUid),
        pendingInvites: arrayRemove(
          normalizedEmail
        ), // <-- This is the "remove and add" logic you remember
      });
      return null;
    } else {
      // --- CASE 2: User Does NOT Exist ---

      // Check if they already have a pending invite
      if (
        activeList.pendingInvites?.includes(
          normalizedEmail
        )
      ) {
        throw new Error(
          "This user already has a pending invitation."
        );
      }

      // Add to pendingInvites on Firebase
      await updateDoc(listRef, {
        pendingInvites: arrayUnion(
          normalizedEmail
        ),
      });

      // Generate the email content for manual sending
      const appUrl =
        process.env.REACT_APP_BASE_URL ||
        "https://your-app-domain.web.app";
      const joinLink = `${appUrl}/join?listId=${activeListId}`;

      const subject = `Invitation to join "${activeList.name}" on Shop Smart`;
      const body = joinLink; // The body is now just the URL

      return { subject, body };
    }
  };

  const [notification, setNotification] =
    useState<Notification | null>(null);
  const [isAuthLoading, setIsAuthLoading] =
    useState<boolean>(true);

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
            ? { ...item, groupId: newGroupId }
            : item
      );
      await updateDoc(listRef, {
        items: newItems,
      });
    }

    // --- Task 2: Update the global product cache ---
    try {
      // Find the item in the cache by its name
      const cachedItem =
        FirebaseProductCacheService.findInCache(
          itemToUpdate.name
        );

      if (cachedItem) {
        // If it exists, update its category
        await FirebaseProductCacheService.updateProductCategory(
          cachedItem.id,
          newGroupId
        );
      } else {
        // If it's a new item not in the cache, add it
        await FirebaseProductCacheService.addProductToCache(
          itemToUpdate.name,
          newGroupId
        );
      }
    } catch (error) {
      console.error(
        "Failed to update product cache:",
        error
      );
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
        user,
        setUser,
        lang,
        setLang,
        lists,
        setLists,
        notification,
        activeListId,
        setActiveListId,
        setNotification,
        activeList,
        isAuthLoading,
        createNewList,
        removeListMember,
        deleteAllDoneItems,
        addListMemberByEmail,
        updateCustomerGroupOrder,
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
