import React, { useEffect, useState, useContext } from 'react';
import { Group, ProductCacheItem, ListItem as ShoppingListItem } from '@/common/model/types';
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
import { UserContext } from '@/context/UserContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

type AllItems = {
  group: Group;
  items: ProductCacheItem[];
};

export default function GeneralItemsModal({ open, onClose }: Props) {
  const { addItemToList, activeListId, activeList, updateItemQuantity, updateItemCheckedAndQuantity, toggleItem } =
    useContext(ShopSmartContext);
  const { user } = useContext(UserContext);
  const [allItems, setAllItems] = useState<AllItems[]>(null);
  const [existsItems, setExistsItems] = useState<Record<string, ShoppingListItem> | null>(null);
  useEffect(() => {
    if (!open) return;
    const cache = FirebaseProductCacheService['getActiveCache']?.().values();
    if (cache) {
      const arr = Array.from(cache);
      const groupedItems = DEFAULT_GROUPS.map((group) => ({
        group,
        items: arr.filter((item) => item.groupId === group.id),
      }));
      setAllItems(groupedItems);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!allItems || !activeList?.items) return;
    const existingItems = {} as Record<string, { checked: boolean; quantity: number; groupId: string }>;
    const flattenedListIDic = flattenGroupedItemsToDict(activeList.items);
    const flattenedCacheItems = allItems ? allItems.flatMap((group) => group.items) : [];

    flattenedCacheItems.forEach((item) => {
      if (flattenedListIDic[item.name] && !flattenedListIDic[item.name].isChecked) {
        existingItems[item.name] = {
          checked: true,
          quantity: flattenedListIDic[item.name].quantity,
          groupId: flattenedListIDic[item.name].groupId,
        };
      }
    });
    setExistsItems(existingItems);
  }, [allItems, open, activeList]);

  function flattenGroupedItemsToDict(ShoppingListItem: ShoppingListItem[]): Record<string, ShoppingListItem> {
    return ShoppingListItem.map((item) => item).reduce(
      (acc, item) => {
        acc[item.name] = item;
        return acc;
      },
      {} as Record<string, ShoppingListItem>
    );
  }

  const handleUpdate = async () => {
    const itemsToAdd: ShoppingListItem[] = [];
    const itemsToUpdate: { item: ShoppingListItem; quantity: number }[] = [];
    const itemsToToggle: ShoppingListItem[] = [];
    const itemsToUpdateCheckedAndQuantity: { item: ShoppingListItem; checked: boolean; quantity: number }[] = [];
    for (const [name, value] of Object.entries(existsItems as Record<string, ShoppingListItem>)) {
      const activeListItem = activeList?.items.find((item) => item.name === name);
      if (activeListItem) {
        if (!activeListItem.isChecked && !value.isChecked) {
          continue;
        }
        if (!activeListItem.isChecked && value.isChecked && activeListItem.quantity !== value.quantity) {
          itemsToUpdateCheckedAndQuantity.push({
            item: activeListItem,
            checked: !activeListItem.isChecked,
            quantity: value.quantity,
          });
          continue;
        }
        if (activeListItem.isChecked && value.isChecked) {
          if (activeListItem.quantity !== value.quantity) {
            itemsToUpdateCheckedAndQuantity.push({
              item: activeListItem,
              checked: !activeListItem.isChecked,
              quantity: value.quantity,
            });
          } else {
            itemsToToggle.push(activeListItem);
          }
          continue;
        }
      } else {
        const timeStamp = Date.now();
        itemsToAdd.push({
          id: crypto.randomUUID(),
          name,
          groupId: value.groupId,
          isChecked: false,
          addedBy: user.uid,
          timestamp: timeStamp,
          quantity: value.quantity,
        });
      }
    }
    for (const { item, quantity } of itemsToUpdate) {
      await updateItemQuantity(activeListId!, item, quantity);
    }
    for (const { item, checked, quantity } of itemsToUpdateCheckedAndQuantity) {
      await updateItemCheckedAndQuantity(activeListId!, item, checked, quantity);
    }
    for (const item of itemsToToggle) {
      await toggleItem(activeListId!, item);
    }
    for (const item of itemsToAdd) {
      await addItemToList(activeListId!, item);
    }
    onClose();
  };

  const handleCheck = (item: ProductCacheItem, isChecked: boolean) => {
    if (isChecked) {
      setExistsItems((prev) => ({
        ...prev,
        [item.name]: { checked: true, quantity: existsItems[item.name]?.quantity || 1, groupId: item.groupId },
      }));
    } else {
      setExistsItems((prev) => ({
        ...prev,
        [item.name]: { checked: false, quantity: existsItems[item.name]?.quantity || 1, groupId: item.groupId },
      }));
    }
  };

  const handleQuantityChange = (item: ProductCacheItem, newQuantity: number) => {
    if (existsItems[item.name]) {
      setExistsItems((prev) => ({
        ...prev,
        [item.name]: { ...prev[item.name], quantity: newQuantity },
      }));
    }
  };
  if (!allItems || !existsItems) return null;
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>בחר פריטים כלליים לרכישה</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          סמן את הפריטים הרלוונטיים ועדכן כמויות. הפריטים מסונכרנים מההיסטוריה שלך.
        </Typography>
        <List>
          {allItems.length === 0 && (
            <Typography color="textSecondary" align="center">
              אין פריטים כלליים להצגה.
            </Typography>
          )}
          {allItems.map((group) => (
            <div key={group.group.id} className="mb-2 bg-white rounded-2xl shadow-sm border border-gray-100">
              <SingleListViewGroupHeader group={group.group} itemsCount={group.items.length} />
              <List>
                {group.items.map((item) => (
                  <ListItem key={item.id} dense sx={{ textAlign: 'right' }}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={existsItems[item.name]?.checked ?? false}
                        onChange={(e) => handleCheck(item, e.target.checked)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <span className="text-2xl">{group.code}</span>
                    <ListItemText primary={item.name} />
                    <Box sx={{ minWidth: 80 }}>
                      <TextField
                        type="number"
                        size="small"
                        label="כמות"
                        value={existsItems[item.name] ? existsItems[item.name].quantity : 1}
                        onChange={(e) => handleQuantityChange(item, e.target.value)}
                        disabled={!existsItems[item.name]}
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
      <DialogActions sx={{ padding: '15px', gap: 2, flexShrink: 0, alignSelf: { xs: 'flex-end', sm: 'end' } }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          ביטול
        </Button>
        <Button onClick={handleUpdate} variant="contained" color="primary">
          עדכון
        </Button>
      </DialogActions>
    </Dialog>
  );
}
