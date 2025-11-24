import { DEFAULT_GROUPS } from "@/configuration/constants";
import {
  GroupId,
  Language,
  ShoppingList,
  User,
} from "@/types";

import { createContext, useState } from "react";

type ShopSmartContextType = {
  user: User | null;
  lang: Language;
  lists: ShoppingList[];
  activeListId?: string | null;
  activeList: ShoppingList | null;
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

const ShopSmartContext =
  createContext<ShopSmartContextType>({
    user: null,
    setUser: (user: User) => {
      user = user;
    },
    lang: null,
    setLang: () => {},

    setActiveListId: () => {},
    activeListId: null,

    lists: [],
    setLists: () => {},
    activeList: null,
    setNotification: (notification: Notification | null) => {
    
    },
  });

const ShopSmartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(
    null
  );
  const [lang, setLang] = useState<Language>(
    Language.HE
  );
  const [lists, setLists] = useState<
    ShoppingList[]
  >([
    {
      id: "1",
      name: "Grocery List",
      ownerId: "user_123",
      sharedWith: ["user_456"],
      items: [
        {
          id: "1",
          name: "חלב",
          groupId: GroupId.DAIRY,
          isChecked: false,
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
      ]
    },
  ]);
  const [activeListId, setActiveListId] =
    useState<string | null>(null);
  return (
    <ShopSmartContext.Provider
      value={{
        user,
        setUser,
        lang,
        setLang,
        lists,
        setLists,
        activeListId,
        setNotification: () => {},
        setActiveListId,
        activeList:
          lists.find(
            (list) => list.id === activeListId
          ) || null,
      }}
    >
      {children}
    </ShopSmartContext.Provider>
  );
};
export { ShopSmartContext, ShopSmartProvider };
