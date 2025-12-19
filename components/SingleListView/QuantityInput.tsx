import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { FormControl } from '@mui/material';
import { ListItem } from '@/common/model/types';

interface Props {
  updateItemQuantity: (listId: string, itemToUpdate: ListItem, newQuantity: number) => Promise<void>;
  item: ListItem;
  listId: string;
}

export function QuantityInput({ updateItemQuantity, item, listId }: Props) {
  return (
    <FormControl variant="outlined">
      <OutlinedInput
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const value = event.target.value;

          // Only update the state if it's a valid final value
          if (/^\d+\.?\d*$/.test(value) && value !== '') {
            const newQuantity = parseFloat(value);
            if (newQuantity > 0) {
              updateItemQuantity(listId, item, newQuantity);
            }
          }
        }}
        onKeyDown={(event) => {
          // Allow all control keys and navigation
          if (event.ctrlKey || event.metaKey || event.altKey) return;

          const allowedKeys = [
            'Backspace',
            'Delete',
            'Tab',
            'Escape',
            'Enter',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
            '.',
            'Decimal', // Explicitly allow decimal keys
          ];

          const isNumber = /[0-9]/.test(event.key);
          const isDot = event.key === '.' || event.key === 'Decimal';
          const currentValue = (event.target as HTMLInputElement).value;
          const hasDecimal = currentValue.includes('.');

          // Allow if it's a number, allowed key, or decimal (if no decimal exists)
          if (!isNumber && !allowedKeys.includes(event.key) && !(isDot && !hasDecimal)) {
            event.preventDefault();
          }
        }}
        defaultValue={item.quantity || 1} // Use defaultValue instead of value
        sx={{
          width: '80px',
          height: '35px',
        }}
        type="text"
        inputProps={{
          inputMode: 'decimal',
          pattern: '[0-9]*[.]?[0-9]*',
          'aria-label': 'יחידת מידה',
        }}
        id="unit-of-measure"
        endAdornment={<InputAdornment position="end">יח'</InputAdornment>}
        aria-describedby="unit of measure"
      />
    </FormControl>
  );
}
