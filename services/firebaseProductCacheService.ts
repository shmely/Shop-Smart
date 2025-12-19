import { Unsubscribe } from "firebase/firestore";
import { addProductToCache, subscribeToProductCache, updateProductCacheCategory } from "../data-layer/firebase-layer";
import { GroupId, ProductCacheItem } from "../common/model/types";




class ListSpecificProductCacheService {
  private caches = new Map<string, Map<string, ProductCacheItem>>();
  private activeListId: string | null = null;
  private unsubscribe: Unsubscribe | null = null;

  setActiveList(listId: string | null): void {
    if (this.activeListId === listId) return;

    // Clean up the old listener before starting a new one
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    this.activeListId = listId;

    if (listId) {
      console.log(`Activating product cache for list: ${listId}`);
      this.unsubscribe = subscribeToProductCache(listId, (products) => {
        const newCache = new Map(products.map(p => [p.id, p]));
        this.caches.set(listId, newCache);
        console.log(`Cache for list ${listId} synced. Contains ${newCache.size} items.`);
      });
    }
  }

  private getActiveCache(): Map<string, ProductCacheItem> | null {
    if (!this.activeListId) return null;
    return this.caches.get(this.activeListId) || null;
  }

  async addProduct(name: string, groupId: GroupId): Promise<void> {
    if (!this.activeListId) return;
    const normalizedName = this.normalizeName(name);
    const trimmedName = name.trim();
    await addProductToCache(this.activeListId, normalizedName, trimmedName, groupId);
  }

  async updateProductCategory(productId: string, newGroupId: GroupId): Promise<void> {
    if (!this.activeListId) return;
    await updateProductCacheCategory(this.activeListId, productId, newGroupId);
  }

  searchSimilar(searchText: string): ProductCacheItem | null {
    const cache = this.getActiveCache();
    if (!cache) return null;

    const normalizedSearch = this.normalizeName(searchText);
    if (cache.has(normalizedSearch)) {
      return cache.get(normalizedSearch)!;
    }
    for (const [key, product] of cache.entries()) {
      if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
        return product;
      }
    }
    return null;
  }

  getSuggestions(input: string, limit = 5): string[] {
    const cache = this.getActiveCache();
    if (!cache) return [];

    const normalizedInput = this.normalizeName(input);
    if (normalizedInput.length < 2) return [];

    const suggestions: string[] = [];
    for (const product of cache.values()) {
      if (this.normalizeName(product.name).includes(normalizedInput)) {
        suggestions.push(product.name);
        if (suggestions.length >= limit) break;
      }
    }
    return suggestions.sort((a, b) => a.length - b.length);
  }


  private normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  }
}
export const FirebaseProductCacheService = new ListSpecificProductCacheService();
