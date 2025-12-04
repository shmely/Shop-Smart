import {
  Language,
  ShoppingList,
  User,
} from "../types";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

import { auth } from "../firebase";

import { TRANSLATIONS } from "@/configuration/constants";

import {
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  getDocs,
} from "firebase/firestore";
import {
  getListRef,
  getListsCollectionRef,
  getUserData,
  listenToAuthChanges,
  listenToUserListsChanges,
  queryUserByEmail,
  queryUserMemberLists,
  removeEmailFromPendingInvites,
  updateUserData,
} from "@/data-layer/firebase-layer";
import { FirebaseProductCacheService } from "@/services/firebaseProductCacheService";

const STORAGE_KEYS = {
  LISTS: "shop-smart-lists",
  USER: "shop-smart-user",
  ACTIVE_LIST_ID: "shop-smart-active-list-id",
  LANGUAGE: "shop-smart-language",
};

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<
    React.SetStateAction<User | null>
  >;
  isAuthLoading: boolean;
  lang: Language;
  setLang: React.Dispatch<
    React.SetStateAction<Language>
  >;
  lists: ShoppingList[];
  setLists: React.Dispatch<
    React.SetStateAction<ShoppingList[]>
  >;
  activeListId?: string | null;
  updateActiveList: (id: string | null) => void;
  activeList: ShoppingList | null;
  t: any;
};

export const UserContext = createContext<
  UserContextType | undefined
>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({
  children,
}: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(
    null
  );
  const [lang, setLang] = useState<Language>(
    Language.HE
  );
  const [isAuthLoading, setIsAuthLoading] =
    useState<boolean>(true);
  const [lists, setLists] = useState<
    ShoppingList[]
  >([]);

  const t = useMemo(
    () => TRANSLATIONS[lang],
    [lang]
  );
  const [activeListId, setactiveListId] =
    useState<string | null>(
      localStorage.getItem(
        STORAGE_KEYS.ACTIVE_LIST_ID
      )
    );

  const updateActiveList = (
    id: string | null
  ) => {
    setactiveListId(id);
    localStorage.setItem(
      STORAGE_KEYS.ACTIVE_LIST_ID,
      id
    );
  };

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

  const onUserListChange = (
    userLists: ShoppingList[]
  ) => {
    setLists(userLists);
    console.log("userLists:", userLists);
    setIsAuthLoading(false);
  };

  const handleAuthChange = async (
    firebaseUser: User | null
  ) => {
    setIsAuthLoading(true);
    if (firebaseUser) {
      firebaseUser.email
        ? firebaseUser.email.toLowerCase()
        : null;

      setUser(firebaseUser);
      const userRef = await getUserData(
        firebaseUser.uid
      );
      // Pass your custom userData object to updateUserData
      await updateUserData(userRef, firebaseUser);

      // --- HANDLE PENDING INVITATION ---
      const pendingListId =
        sessionStorage.getItem(
          "pendingInvitation"
        );
      const userEmail =
        firebaseUser.email?.toLowerCase();

      if (pendingListId && userEmail) {
        const listRef = getListRef(pendingListId);

        await removeEmailFromPendingInvites(
          listRef,
          userEmail,
          firebaseUser.uid
        );

        sessionStorage.removeItem(
          "pendingInvitation"
        );
        updateActiveList(pendingListId);
      }
    } else {
      // User is signed out.
      setUser(null);
      setLists([]); // Clear lists on logout
    }
    setIsAuthLoading(false);
  };

  useEffect(() => {
    // This listener runs once on load, and again whenever the user logs in or out.
    const unsubscribe = listenToAuthChanges(
      auth,
      handleAuthChange
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
  // Start listening to the product cache when the app loads
  FirebaseProductCacheService.initialize();

  // Clean up the listener when the app closes or component unmounts
  return () => {
    FirebaseProductCacheService.cleanup();
  };
}, []);

  useEffect(() => {
    if (!user?.uid) return; // Don't query if there's no user

    setIsAuthLoading(true);
    const listsRef = getListsCollectionRef();

    // It only fetches lists where the current user's UID is in the 'members' array.
    const userMemberListsQueryResults =
      queryUserMemberLists(user.uid, listsRef);

    const unsubscribe = listenToUserListsChanges(
      userMemberListsQueryResults,
      onUserListChange
    );

    return () => unsubscribe();
  }, [user]);

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

    const listRef = getListRef(activeListId);

    // Check if a user with this email already exists
    const userQuery = queryUserByEmail(
      normalizedEmail
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

  // useEffect(() => {
  //   localStorage.setItem(
  //     STORAGE_KEYS.ACTIVE_LIST_ID,
  //     activeListId
  //   );
  // }, [activeListId]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthLoading,
        lang,
        setLang,
        lists,
        setLists,
        activeList,
        activeListId,
        updateActiveList,
        t,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
