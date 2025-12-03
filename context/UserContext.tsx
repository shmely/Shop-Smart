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

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  setDoc,
  getDocs,
} from "firebase/firestore";

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
            setactiveListId(pendingListId);
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
        console.log("userLists:", userLists);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount or user change
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
