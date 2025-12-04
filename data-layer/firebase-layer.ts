import { db } from "@/firebase";
import { arrayRemove, arrayUnion, collection, doc, CollectionReference, onSnapshot, Unsubscribe, DocumentData, DocumentReference, DocumentSnapshot, getDoc, Query, query, setDoc, updateDoc, where, writeBatch, Timestamp } from "firebase/firestore";
import {
    GroupId,
    ProductCacheItem,
    ShoppingList,
    User,
} from "../types";

import { Auth, onAuthStateChanged } from "firebase/auth";

export const getDocumentSnapshot = (docRef: DocumentReference<DocumentData, DocumentData>): Promise<DocumentSnapshot<DocumentData, DocumentData>> => {
    return getDoc(docRef);
};

export const getUserData = (userId: string): DocumentReference<DocumentData, DocumentData> => {
    try {
        const userDocRef = doc(db, "users", userId);
        return userDocRef;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw new Error("Failed to fetch user data");
    }
};

export const updateUserData = async (userRef: DocumentReference<DocumentData, DocumentData>, firebaseUser: User): Promise<void> => {
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
};

export const getListRef = (listId: string): DocumentReference<DocumentData, DocumentData> => {
    return doc(db, "shoppingLists", listId);
}

export const removeEmailFromPendingInvites = async (listRef: DocumentReference<DocumentData, DocumentData>, email: string, userId: string): Promise<void> => {
    await updateDoc(listRef, {
        members: arrayUnion(
            userId
        ),
        pendingInvites:
            arrayRemove(email.toLocaleLowerCase()),
    });
};

export const getListsCollectionRef = (): CollectionReference<DocumentData, DocumentData> => {
    return collection(db, "shoppingLists");
};

export const queryUserMemberLists = (userId: string, listRef: Query<DocumentData, DocumentData>): Query<DocumentData, DocumentData> => {
    return query(
        listRef,
        where("members", "array-contains", userId)
    );
};

export const queryUserByEmail = (email: string): Query<DocumentData, DocumentData> => {
    return query(
        collection(db, "users"),
        where("email", "==", email.toLowerCase())
    );
}

export const listenToUserListsChanges = (
    userQuery: Query<DocumentData, DocumentData>,
    onUpdate: (lists: ShoppingList[]) => void
): Unsubscribe => {
    const unsubscribe = onSnapshot(
        userQuery,
        (querySnapshot) => {
            const userLists: ShoppingList[] = [];
            querySnapshot.forEach((doc) => {
                userLists.push({
                    id: doc.id,
                    ...doc.data(),
                } as ShoppingList);
            });
            // Call the provided callback with the new data
            onUpdate(userLists);
        }
    );
    // Return the cleanup function
    return unsubscribe;
};

export const listenToAuthChanges = (
    auth: Auth,
    // Use the aliased FirebaseUser type here
    onAuthChange: (user: User | null) => void
): Unsubscribe => {
    const unsubscribe = onAuthStateChanged(auth, onAuthChange);
    return unsubscribe;
};

export const updateListItems = async (listRef: DocumentReference<DocumentData, DocumentData>, items: any[]): Promise<void> => {
    return await updateDoc(listRef, { items });
}



// --- Product Cache Functions ---

const PRODUCT_CACHE_COLLECTION = "productCache";

/**
 * Adds or overwrites a product in the Firebase cache using a specific ID.
 * @param productId The unique ID for the document (e.g., the normalized product name).
 * @param itemName The display name of the product.
 * @param groupId The category ID for the product.
 */
export const addProductToCache = async (
  productId: string,
  itemName: string,
  groupId: GroupId
): Promise<void> => {
  const docRef = doc(db, PRODUCT_CACHE_COLLECTION, productId);
  await setDoc(docRef, {
    name: itemName,
    groupId: groupId,
    addedAt: Timestamp.now(),
  });
};

/**
 * Sets up a real-time listener for the entire product cache.
 * @param onUpdate A callback function that receives the full, updated list of products.
 * @returns An unsubscribe function to close the listener.
 */
export const subscribeToProductCache = (onUpdate: (products: ProductCacheItem[]) => void): Unsubscribe => {
  const q = query(collection(db, PRODUCT_CACHE_COLLECTION));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const products: ProductCacheItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id, // The normalized name
        name: data.name,
        groupId: data.groupId,
        addedAt: (data.addedAt as Timestamp).toMillis(),
      });
    });
    onUpdate(products);
  });
  return unsubscribe;
};

export const updateProductCacheCategory = async (
  productId: string,
  newGroupId: GroupId
): Promise<void> => {
  const docRef = doc(db, PRODUCT_CACHE_COLLECTION, productId);
  await updateDoc(docRef, { groupId: newGroupId });
};
