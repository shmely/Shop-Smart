import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase"; // Your firebase config file
import { GroupId, ProductCacheItem } from "../types";

const COLLECTION_NAME = "productCache";

// This will hold the cache in memory for instant access
let localCache: ProductCacheItem[] = [];
let unsubscribe: Unsubscribe | null = null;

// --- Public Methods ---

/**
 * Starts listening for real-time updates from Firebase and keeps the local cache in sync.
 * Call this once when your main app component mounts.
 */
const subscribeToCache = (): Unsubscribe => {
  if (unsubscribe) {
    unsubscribe(); // Prevent multiple listeners
  }

  const q = query(collection(db, COLLECTION_NAME));
  unsubscribe = onSnapshot(q, (snapshot) => {
    const newCache: ProductCacheItem[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      newCache.push({
        id: doc.id,
        name: data.name,
        groupId: data.groupId,
        addedAt: data.addedAt,
      } as ProductCacheItem);
    });
    localCache = newCache;
    console.log(`Product cache synced. Contains ${localCache.length} items.`);
  });

  return unsubscribe;
};

/**
 * Searches the in-memory cache for an item.
 * @param itemName The name of the item to search for.
 * @returns The cached item or null if not found.
 */
const findInCache = (itemName: string): ProductCacheItem | null => {
  const normalizedItemName = itemName.trim().toLowerCase();
  // A simple search for now, can be improved with fuzzy matching later
  const found = localCache.find(
    (item) => item.name.toLowerCase() === normalizedItemName
  );
  return found || null;
};

/**
 * Adds a new product to the Firebase cache.
 * The local cache will update automatically via the real-time listener.
 * @param itemName The name of the new item.
 * @param groupId The category ID from Gemini.
 */
const addProductToCache = async (
  itemName: string,
  groupId: GroupId
): Promise<void> => {
  const normalizedItemName = itemName.trim().toLowerCase();
  // Prevent adding duplicates
  if (findInCache(normalizedItemName)) {
    console.log(`"${itemName}" already in cache.`);
    return;
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    name: normalizedItemName,
    groupId: groupId,
  });
};

/**
 * Updates the category of an existing product in the Firebase cache.
 * @param productId The unique ID of the product document in Firebase.
 * @param newGroupId The new category ID.
 */
const updateProductCategory = async (
  productId: string,
  newGroupId: GroupId
): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, productId);
  await updateDoc(docRef, {
    groupId: newGroupId,
  });
};

export const FirebaseProductCacheService = {
  subscribeToCache,
  findInCache,
  addProductToCache,
  updateProductCategory,
};