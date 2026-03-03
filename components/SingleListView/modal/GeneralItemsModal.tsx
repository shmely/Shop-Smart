import React, { useEffect, useState, useContext } from 'react';
import { Group, GroupedItem, ProductCacheItem, ListItem as ShoppingListItem } from '@/common/model/types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  TextField,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { FirebaseProductCacheService } from '@/services/firebaseProductCacheService';
import { DEFAULT_GROUPS } from '@/configuration/constants';
import SingleListViewGroupHeader from '../SingleListViewGroupHeader';
import { ShopSmartContext } from '@/context/ShopSmartContext/ShopSmartContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdate: (items: { [productId: string]: { checked: boolean; quantity: number } }) => void;
}

type AllItems = {
  group: Group;
  items: ShoppingListItem[];
};

export default function GeneralItemsModal({ open, onClose, onUpdate }: Props) {
  const { addItemToList, activeListId, activeList } = useContext(ShopSmartContext);
  const [groupedAllItems, setGroupedAllItems] = useState<AllItems[]>([]);
  //const [checkedState, setCheckedState] = useState<{ [id: string]: boolean }>({});
  //const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [currentItems, setCurrentItems] = useState<{ [id: string]: GroupedItem['items'][0] }>({});
  useEffect(() => {
    if (!open) return;
    const cache = FirebaseProductCacheService['getActiveCache']?.();
    if (cache) {
      const arr = Array.from(cache.values());
      const groupedCacheItems = groupProductCacheItemsByGroup(arr, DEFAULT_GROUPS);
      setGroupedAllItems(groupedCacheItems);
      setCurrentItems(flattenGroupedItemsToDict(activeList.items));
      //setIncludeItems(groupedCacheItems, currentItems);
    }
  }, [open, activeList]);

  function flattenGroupedItemsToDict(ShoppingListItem: ShoppingListItem[]): { [id: string]: ShoppingListItem } {
    return ShoppingListItem.map((item) => item).reduce(
      (acc, item) => {
        acc[item.name] = item;
        return acc;
      },
      {} as { [id: string]: ShoppingListItem }
    );
  }

  // function setIncludeItems(
  //   groupedCacheItems: GroupedProductCacheItem[],
  //   currentItems: { [id: string]: GroupedItem['items'][0] }
  // ) {
  //   const checked: { [id: string]: boolean } = {};
  //   const qty: { [id: string]: number } = {};
  //   groupedCacheItems.forEach((groupItem) => {
  //     groupItem.productCacheItem.forEach((item) => {
  //       checked[item.id] = !!currentItems[item.name];
  //       qty[item.id] = currentItems[item.name]?.quantity || 1;
  //     });
  //   });
  //   setCheckedState(checked);
  //   setQuantities(qty);
  // }

  function groupProductCacheItemsByGroup(items: ProductCacheItem[], groups: Group[]): AllItems[] {
    return groups.map((group) => ({
      group,
      items: items
        .filter((item) => item.groupId === group.id)
        .map((item) => ({
          id: item.id,
          name: item.name,
          groupId: item.groupId,
          isChecked: currentItems[item.name] ? true : false,
          addedBy: '',
          timestamp: item.addedAt,
          quantity: currentItems[item.name]?.quantity || 1,
        })),
    }));
  }
  const handleCheck = (id: string) => {};

  const handleQuantityChange = (id: string, value: string) => {
    const num = Math.max(1, parseInt(value) || 1);
    // setQuantities((prev) => ({
    //   ...prev,
    //   [id]: num,
    // }));
  };

  const handleUpdate = () => {
    // Only send checked items with their quantities
    const result: { [productId: string]: { checked: boolean; quantity: number } } = {};
    groupedAllItems.forEach((group) => {
      group.productCacheItem.forEach((item) => {
        // if (checkedState[item.id]) {
        //   result[item.id] = { checked: true, quantity: quantities[item.id] || 1 };
        // }
      });
    });
    onUpdate(result);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>בחר פריטים כלליים לרכישה</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          סמן את הפריטים הרלוונטיים ועדכן כמויות. הפריטים מסונכרנים מההיסטוריה שלך.
        </Typography>
        <List>
          {groupedAllItems.length === 0 && (
            <Typography color="textSecondary" align="center">
              אין פריטים כלליים להצגה.
            </Typography>
          )}
          {groupedAllItems.flatMap((groupItems) => (
            <div key={groupItems.group.id} className="mb-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <SingleListViewGroupHeader group={groupItems.group} itemsCount={groupItems.items.length} />
              <List>
                {groupItems.items.map((item) => (
                  <ListItem key={item.id} dense sx={{ textAlign: 'right' }}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={currentItems[item.id] ? true : false}
                        onChange={() => handleCheck(item.name)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <span className="text-2xl">{groupItems.group.code}</span>
                    <ListItemText primary={item.name} />
                    <Box sx={{ minWidth: 80 }}>
                      <TextField
                        type="number"
                        size="small"
                        label="כמות"
                        value={1}
                        //value={quantities[item.id] || 1}
                        onChange={(e) => handleQuantityChange(item.name, e.target.value)}
                        //disabled={!checkedState[item.id]}
                        inputProps={{ min: 1, style: { width: 50 } }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </div>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ביטול</Button>
        <Button onClick={handleUpdate} variant="contained" color="primary">
          עדכן רשימה
        </Button>
      </DialogActions>
    </Dialog>
  );
}
