import { useMemo, useContext } from "react";
import {
  GroupId,
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
  // Load initial data from localStorage
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

  const [user, setUser] =
    useState<User | null>(() => {
      try {
        const savedUser = localStorage.getItem(
          STORAGE_KEYS.USER
        );
        return savedUser
          ? JSON.parse(savedUser)
          : null;
      } catch (error) {
        console.error(
          "Error loading user from localStorage:",
          error
        );
        return null;
      }
    });

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

  const activeList = useMemo(() => {
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_LIST_ID,
      activeListId
    );
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
    useState<boolean>(false);

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
