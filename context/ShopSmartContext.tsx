import { useMemo } from "react";
import {
  Language,
  ShoppingList,
  Notification,
  User,
} from "@/types";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

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
  >(() => {
    try {
      const savedLists = localStorage.getItem(
        STORAGE_KEYS.LISTS
      );
      return savedLists
        ? JSON.parse(savedLists)
        : [];
    } catch (error) {
      console.error(
        "Error loading lists from localStorage:",
        error
      );
      return [];
    }
  });

  useEffect(() => {
    // This listener runs once on load, and again whenever the user logs in or out.
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          // User is signed in.
          const userData: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setUser(userData);
        } else {
          // User is signed out.
          setUser(null);
        }
        // 3. Once we have a definitive answer, set loading to false.
        setIsAuthLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const [activeListId, setActiveListId] =
    useState<string | null>(() => {
      try {
        return localStorage.getItem(
          STORAGE_KEYS.ACTIVE_LIST_ID
        );
      } catch (error) {
        console.error(
          "Error loading active list ID from localStorage:",
          error
        );
        return null;
      }
    });

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

  // Save lists to localStorage whenever they change
  useEffect(() => {
    console.log(
      "📦 Saving lists to localStorage:",
      lists
    );
    try {
      localStorage.setItem(
        STORAGE_KEYS.LISTS,
        JSON.stringify(lists)
      );
    } catch (error) {
      console.error(
        "Error saving lists to localStorage:",
        error
      );
    }
  }, [lists]);

  // Save language to localStorage whenever it changes
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

  const [notification, setNotification] =
    useState<Notification | null>(null);
  const [isAuthLoading, setIsAuthLoading] =
    useState<boolean>(true);

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
      }}
    >
      {children}
    </ShopSmartContext.Provider>
  );
}
