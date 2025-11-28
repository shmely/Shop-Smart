import { it } from 'node:test';
import { Group, GroupId, Language } from '../types';

export const DEFAULT_GROUPS: Group[] = [
  { id: GroupId.FRUITS_VEG, order: 1, icon: '🍎', translationKey: 'fruits_veg' },
  { id: GroupId.DAIRY, order: 2, icon: '🧀', translationKey: 'dairy' },
  { id: GroupId.BAKERY, order: 3, icon: '🥖', translationKey: 'bakery' },
  { id: GroupId.FROZEN, order: 4, icon: '🧊', translationKey: 'frozen' },
  { id: GroupId.DRY_GOODS, order: 5, icon: '🍝', translationKey: 'dry_goods' },
  { id: GroupId.CLEANING, order: 6, icon: '🧼', translationKey: 'cleaning' },
  { id: GroupId.BUTCHER, order: 7, icon: '🥩', translationKey: 'butcher' },
  { id: GroupId.OTHER, order: 99, icon: '📦', translationKey: 'other' }

];

export const TRANSLATIONS = {
  [Language.HE]: {
    app_name: 'שופ-סמארט',
    fruits_veg: 'פירות וירקות',
    dairy: 'מוצרי חלב',
    bakery: 'מאפים',
    frozen: 'קפואים',
    dry_goods: 'מוצרים יבשים',
    cleaning: 'ניקיון וטיפוח',
    other: 'כללי',
    grocery_list: 'רשימת קניות',
    camping_list: 'ציוד קמפינג',
    add_item: 'הוסף פריט',
    login_google: 'התחבר עם Google',
    share_list: 'שתף רשימה',
    shared_with: 'משותף עם',
    empty_list: 'הרשימה ריקה. הוסף פריטים!',
    settings: 'הגדרות',
    logout: 'התנתק',
    notification_new_items: 'פריטים חדשים נוספו לרשימה',
    notification_single_item: 'נוסף לרשימה',
    sort_groups: 'סדר מעבר בסופר',
    typing: 'מקליד...',
    smart_sort: 'מיון חכם ע"י Gemini',
    welcome: 'שלום',
    my_lists: 'הרשימות שלי',
    create_list: 'צור רשימה חדשה',
    list_name_placeholder: 'שם הרשימה',
    create: 'צור',
    cancel: 'ביטול',
    delete: 'מחק',
    copied: 'הקישור הועתק!',
    share_instruction: 'שלח קישור זה לאחרים כדי לשתף:',
    login_error_cancelled: 'ההתחברות בוטלה על ידי המשתמש.',
    login_error_general: 'שגיאת התחברות כללית. נסה שוב.',
    loadingMessage: 'טוען, אנא המתן...',
    guest: 'אורח',
    butcher: 'קצבייה',
    change_language: "שנה שפה",
    done_items: 'פריטים שהושלמו',
    items: 'פריטים',
    item: 'פריט',
    one: 'אחד',
    

  },
  [Language.EN]: {
    app_name: 'ShopSmart',
    fruits_veg: 'Fruits & Vegetables',
    dairy: 'Dairy',
    bakery: 'Bakery',
    frozen: 'Frozen',
    dry_goods: 'Dry Goods',
    cleaning: 'Cleaning & Personal',
    other: 'Other',
    grocery_list: 'Grocery List',
    camping_list: 'Camping List',
    add_item: 'Add Item',
    login_google: 'Login with Google',
    share_list: 'Share List',
    shared_with: 'Shared with',
    empty_list: 'List is empty. Add items!',
    settings: 'Settings',
    logout: 'Logout',
    notification_new_items: 'new items added to the',
    notification_single_item: 'added to the',
    sort_groups: 'Supermarket Walk Order',
    typing: 'Typing...',
    smart_sort: 'Smart sort by Gemini',
    welcome: 'Hello',
    my_lists: 'My Lists',
    create_list: 'Create New List',
    list_name_placeholder: 'List Name',
    create: 'Create',
    cancel: 'Cancel',
    delete: 'Delete',
    copied: 'Link copied!',
    share_instruction: 'Send this link to share:',
    login_error_cancelled: 'Login cancelled by user.',
    login_error_general: 'General login error. Please try again.',
    loadingMessage: 'Loading, please wait...',
    guest: 'Guest',
    change_language: "Change Language",
    done_items: 'Done Items',
    items: 'Items',
    item: 'Item',
    one: 'One',
  }
};



// Simulating a second user for notification testing
export const OTHER_USER = {
  id: 'user_456',
  name: 'Sarah Levy',
  email: 'sarah@example.com',
  avatarUrl: 'https://picsum.photos/101/101'
};