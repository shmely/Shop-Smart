import { GroupId, Language, ShoppingList, User } from '@/types';
import { createContext, useState } from 'react';

type ShopSmartContextType = {
  user: User | null;
  lang: Language;
  lists: ShoppingList[];
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
  setLists: React.Dispatch<React.SetStateAction<ShoppingList[]>>;
};

const ShopSmartContext = createContext<ShopSmartContextType>({
  user: null,
  setUser: () => {},
  lang: Language.EN,
  setLang: () => {},
  lists: [],
  setLists: () => {[
      {
        id: "1",
        name: "Grocery List",
        ownerId: "user_123",
        sharedWith: ["user_456"],
        items: [
          {
            id: "1",
            name: "Milk",
            groupId: GroupId.DAIRY, 
            isChecked: false,
            addedBy: "user_123",
            timestamp: Date.now(),
          },
          {
            id: "2",
            name: "Bread",
            groupId: GroupId.BAKERY,
            isChecked: true,
            addedBy: "user_123",
            timestamp: Date.now(),
          },
        ],
      },
    ]},
});

const ShopSmartProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>(Language.HE);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  return (
    <ShopSmartContext.Provider value={{ user, setUser, lang, setLang, lists, setLists }}>
      {children}
    </ShopSmartContext.Provider>
  );
};
export { ShopSmartContext, ShopSmartProvider };