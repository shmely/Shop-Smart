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
  setDoc,
  deleteDoc,
} from "firebase/firestore";

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
  updateListItems: (
    listId: string,
    newItems: ListItem[]
  ) => Promise<void>;
  addListMember: (
    listId: string,
    memberUid: string
  ) => Promise<void>;
  removeListMember: (
    listId: string,
    memberUid: string
  ) => Promise<void>;
  addListMemberByEmail: (
    email: string
  ) => Promise<void>;
  updateCustomerGroupOrder: (customerGroupOrder: {
    [key in GroupId]?: number;
  }) => Promise<void>;

  deleteList: (listId: string) => Promise<void>;
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
        if (firebaseUser) {
          // User is signed in.
          const userData: User = {
            uid: firebaseUser.uid,
            email:
              firebaseUser.email.toLocaleLowerCase(),
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
              email: firebaseUser.email,
              displayName:
                firebaseUser.displayName,
            },
            { merge: true }
          );
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

  const updateListItems = async (
    listId: string,
    newItems: ListItem[]
  ) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    await updateDoc(listRef, { items: newItems });
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

  const addListMember = async (
    listId: string,
    memberUid: string
  ) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    await updateDoc(listRef, {
      members: arrayUnion(memberUid),
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

  const [activeListId, setActiveListId] = useState<string | null>("");
    // useState<string | null>(() => {
    //   try {
    //     return localStorage.getItem(
    //       STORAGE_KEYS.ACTIVE_LIST_ID
    //     );
    //   } catch (error) {
    //     console.error(
    //       "Error loading active list ID from localStorage:",
    //       error
    //     );
    //     return null;
    //   }
    // });

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
  ) => {
    if (!activeListId) return;
    const normalizedEmail = email
      .toLowerCase()
      .trim();
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("email", "==", normalizedEmail) // 3. Query with the lowercase email
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error(
        "User with that email not found."
      );
    }

    const memberUid = querySnapshot.docs[0].id;

    // 2. Add the UID to the list's members array
    const listRef = doc(
      db,
      "shoppingLists",
      activeListId
    );
    await updateDoc(listRef, {
      members: arrayUnion(memberUid),
    });
  };

  const [notification, setNotification] =
    useState<Notification | null>(null);
  const [isAuthLoading, setIsAuthLoading] =
    useState<boolean>(true);

  const deleteList = async (listId: string) => {
    const listRef = doc(
      db,
      "shoppingLists",
      listId
    );
    if (!listRef) return;
    await deleteDoc(listRef);
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
        updateListItems,
        addListMember,
        removeListMember,
        addListMemberByEmail,
        updateCustomerGroupOrder,
        deleteList,
      }}
    >
      {children}
    </ShopSmartContext.Provider>
  );
}
