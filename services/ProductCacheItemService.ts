import { GroupId,ProductCacheItem } from "../types";


// In-memory cache (you could later persist this to localStorage)
class ProductCacheItemService {
  private cache = new Map<string, ProductCacheItem>();

  // Add a product to cache
  addProduct(name: string, groupId: GroupId): void {
    const normalizedName = this.normalizeName(name);
    this.cache.set(normalizedName, {
      name: name.trim(),
      groupId,
      addedAt: Date.now()
    });
    this.saveToStorage();
  }

  // Search for similar products (SQL LIKE '%text%' behavior)
  searchSimilar(searchText: string): ProductCacheItem | null {
    const normalizedSearch = this.normalizeName(searchText);
    
    // First try exact match
    if (this.cache.has(normalizedSearch)) {
      return this.cache.get(normalizedSearch)!;
    }

    // Then try partial matches
    for (const [key, product] of this.cache.entries()) {
      if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
        return product;
      }
    }

    return null;
  }

  // Get all product names for autocomplete
  getAllProductNames(): string[] {
    return Array.from(this.cache.values()).map(item => item.name);
  }

  // Get suggestions based on partial input
  getSuggestions(input: string, limit = 5): string[] {
    const normalizedInput = this.normalizeName(input);
    if (normalizedInput.length < 2) return [];

    const suggestions = Array.from(this.cache.values())
      .filter(item => this.normalizeName(item.name).includes(normalizedInput))
      .sort((a, b) => a.name.length - b.name.length) // Prefer shorter/more exact matches
      .slice(0, limit)
      .map(item => item.name);

    return suggestions;
  }

  private normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Persist to localStorage
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('productCache', JSON.stringify(data));
    } catch (error) {
      console.warn('Could not save product cache to localStorage:', error);
    }
  }

  // Load from localStorage
  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('productCache');
      if (stored) {
        const data: [string, ProductCacheItem][] = JSON.parse(stored);
        this.cache = new Map(data);
      }
    } catch (error) {
      console.warn('Could not load product cache from localStorage:', error);
    }
  }

  // Populate with some initial common products
  initializeDefaults(): void {
    const defaults: [string, GroupId][] = [
      ['חלב', GroupId.DAIRY],
      ['לחם', GroupId.BAKERY],
      ['תפוחים', GroupId.FRUITS_VEG],
      ['גבינה', GroupId.DAIRY],
      ['בננות', GroupId.FRUITS_VEG],
    ];

    defaults.forEach(([name, groupId]) => {
      this.addProduct(name, groupId);
    });
  }
}

// Export singleton instance
export const ProductCacheItemsService = new ProductCacheItemService();