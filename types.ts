export enum Language {
  HE = 'he',
  EN = 'en'
}

export enum GroupId {
  FRUITS_VEG = 'fruits_veg',
  DAIRY = 'dairy',
  BAKERY = 'bakery',
  FROZEN = 'frozen',
  DRY_GOODS = 'dry_goods',
  CLEANING = 'cleaning',
  OTHER = 'other',
  BUTCHER = "BUTCHER"
}

export interface Group {
  id: GroupId;
  order: number;
  icon: string;
  translationKey: string;
}

export interface ListItem {
  id: string;
  name: string;
  groupId: GroupId;
  isChecked: boolean;
  addedBy: string; // User ID
  timestamp: number;
  quantity: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[]; // Array of User IDs
  items: ListItem[];
  customGroupOrder?: Record<string, number>; // Allow users to override default order
}


export interface ShopSmartUser {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Notification {
  id: string;
  message: string;
  listName: string;
  timestamp: number;
}

export interface ProductCacheItem {
  name: string;
  groupId: GroupId;
  addedAt: number;
}