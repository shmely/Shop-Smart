import { DEFAULT_GROUPS } from "@/configuration/constants";
import {
  GroupId,
  Language,
  ShoppingList,
  Notification,
  ShopSmartUser,
} from "@/types";

import {
  createContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  User as FirebaseAuthUser,
} from "firebase/auth";

type ShopSmartContextType = {
  user: ShopSmartUser | null;
  lang: Language;
  lists: ShoppingList[];
  activeListId?: string | null;
  activeList: ShoppingList | null;
  notification: Notification | null;
  isAuthLoading: boolean;
  setUser: React.Dispatch<
    React.SetStateAction<ShopSmartUser | null>
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

const ShopSmartContext =
  createContext<ShopSmartContextType>({
    user: null,
    setUser: (user: ShopSmartUser) => {
      user = user;
    },
    lang: null,
    setLang: (language: Language) => {
      language = language;
    },
    setActiveListId: () => {},
    activeListId: null,
    notification: null,
    lists: [],
    setLists: () => {},
    activeList: null,
    setNotification: (
      notification: Notification | null
    ) => {
      notification = notification;
    },
    isAuthLoading: true,
  });

const ShopSmartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] =
    useState<ShopSmartUser | null>(null);
  const [lang, setLang] = useState<Language>(
    Language.HE
  );
  const [isAuthLoading, setIsAuthLoading] =
    useState(true);
  const [notification, setNotification] =
    useState<Notification | null>(null);
  const [lists, setLists] = useState<
    ShoppingList[]
  >([
    {
      id: "1",
      name: "רשימת קניות לסופר",
      ownerId: "user_123",
      sharedWith: ["user_456"],
      items: [
        {
          id: "1",
          name: "חלב",
          groupId: GroupId.DAIRY,
          isChecked: true,
          addedBy: "user_123",
          timestamp: Date.now(),
        },
        {
          id: "2",
          name: "לחם",
          groupId: GroupId.BAKERY,
          isChecked: true,
          addedBy: "user_123",
          timestamp: Date.now(),
        },
        {
          id: "3",
          name: "עגבניה",
          groupId: GroupId.FRUITS_VEG,
          isChecked: true,
          addedBy: "user_123",
          timestamp: Date.now(),
        },
      ],
    },
  ]);
  const [activeListId, setActiveListId] =
    useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          const customUserObject: ShopSmartUser =
            {
              id: firebaseUser.uid,
              name:
                firebaseUser.displayName ||
                "משתמש",
              avatarUrl:
                firebaseUser.photoURL || "",
            };
          setUser(customUserObject);
        } else {
          setUser(null);
        }
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const activeList = useMemo(() => {
      return lists.find((list) => list.id === activeListId) || null;
  }, [lists, activeListId]);

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
};
export { ShopSmartContext, ShopSmartProvider };
