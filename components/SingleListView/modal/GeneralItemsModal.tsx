import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { FirebaseProductCacheService } from "@/services/firebaseProductCacheService";
import { ProductCacheItem } from "@/common/model/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdate: (items: { [productId: string]: { checked: boolean; quantity: number } }) => void;
  currentListItems: { [productId: string]: { quantity: number } };
}

export default function GeneralItemsModal({
  open,
  onClose,
  onUpdate,
  currentListItems,
}: Props) {
  const [items, setItems] = useState<ProductCacheItem[]>([]);
  const [checkedState, setCheckedState] = useState<{ [id: string]: boolean }>({});
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});

  // Load items from firebase cache on open
  useEffect(() => {
    if (!open) return;
    // Get all items from the active cache
    const cache = FirebaseProductCacheService["getActiveCache"]?.();
    if (cache) {
      const arr = Array.from(cache.values());
      setItems(arr);
      // Set checked and quantities from current list
      const checked: { [id: string]: boolean } = {};
      const qty: { [id: string]: number } = {};
      arr.forEach((item) => {
        checked[item.id] = !!currentListItems[item.id];
        qty[item.id] = currentListItems[item.id]?.quantity || 1;
      });
      setCheckedState(checked);
      setQuantities(qty);
    }
  }, [open, currentListItems]);

  const handleCheck = (id: string) => {
    setCheckedState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleQuantityChange = (id: string, value: string) => {
    const num = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({
      ...prev,
      [id]: num,
    }));
  };

  const handleUpdate = () => {
    // Only send checked items with their quantities
    const result: { [productId: string]: { checked: boolean; quantity: number } } = {};
    items.forEach((item) => {
      if (checkedState[item.id]) {
        result[item.id] = { checked: true, quantity: quantities[item.id] || 1 };
      }
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
          {items.length === 0 && (
            <Typography color="textSecondary" align="center">
              אין פריטים כלליים להצגה.
            </Typography>
          )}
          {items.map((item) => (
            <ListItem key={item.id} dense>
              <ListItemIcon>
                <Checkbox
                  edge="start"
                  checked={!!checkedState[item.id]}
                  onChange={() => handleCheck(item.id)}
                  tabIndex={-1}
                  disableRipple
                />
              </ListItemIcon>
              <ListItemText primary={item.name} />
              <Box sx={{ minWidth: 80 }}>
                <TextField
                  type="number"
                  size="small"
                  label="כמות"
                  value={quantities[item.id] || 1}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  disabled={!checkedState[item.id]}
                  inputProps={{ min: 1, style: { width: 50 } }}
                />
              </Box>
            </ListItem>
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