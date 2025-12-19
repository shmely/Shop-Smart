import { Language, User } from '../common/model/types';
import { createContext, useState, useEffect, ReactNode, useMemo, useContext } from 'react';
import { auth } from '../firebase';
import { TRANSLATIONS, STORAGE_KEYS } from '@/configuration/constants';
import { getUserData, listenToAuthChanges, updateUserData } from '@/data-layer/firebase-layer';
import { requestPermissionAndGetToken, saveTokenToFirestore } from '@/data-layer/firebase-messaging-service';

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthLoading: boolean;
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
  t: any;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>(Language.HE);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  useEffect(() => {
    // This listener runs once on load, and again whenever the user logs in or out.
    const unsubscribe = listenToAuthChanges(auth, handleAuthChange);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, JSON.stringify(lang));
    } catch (error) {
      console.error('Error saving language to localStorage:', error);
    }
  }, [lang]);

  const handleAuthChange = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const userRef = await getUserData(firebaseUser.uid);
      await updateUserData(userRef, firebaseUser);
      setUser(firebaseUser);

      const fcmToken = await requestPermissionAndGetToken();
      if (fcmToken) {
        await saveTokenToFirestore(firebaseUser.uid, fcmToken);
      }
    } else {
      setUser(null);
    }
    setIsAuthLoading(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthLoading,
        lang,
        setLang,
        t,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
