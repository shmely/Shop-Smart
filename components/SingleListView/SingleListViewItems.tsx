import {
  CheckIcon,
  TrashIcon,
} from "@/configuration/icons";
import { ListItem } from "@/types";
import { useSingleListViewMain } from "./hooks/useSingleListViewMain";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import { FormControl } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

interface Props {
  items: ListItem[];
}
export default function SingleListViewItems({
  items,
}: Props) {
  const { toggleItem, updateItemQuantity } =
    useSingleListViewMain();
  return (
    <div className="divide-y  divide-gray-100 ps-6">
      {items.map((item) => (
        <div
          key={item.id}
          className={`p-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
            item.isChecked ? "bg-gray-50/50" : ""
          }`}
        >
          <div
            onClick={() => toggleItem(item.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              item.isChecked
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-gray-300"
            }`}
          >
            {item.isChecked && <CheckIcon />}
          </div>
          <span
            className={`flex-1 text-base ${
              item.isChecked
                ? "text-gray-400 line-through decoration-emerald-500/40"
                : "text-gray-800"
            }`}
          >
            {item.name}
          </span>
          {!item.isChecked && (
            <FormControl variant="outlined">
              <OutlinedInput
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>
                ) => {
                  const value =
                    event.target.value;

                  // Only update the state if it's a valid final value
                  if (
                    /^\d+\.?\d*$/.test(value) &&
                    value !== ""
                  ) {
                    const newQuantity =
                      parseFloat(value);
                    if (newQuantity > 0) {
                      updateItemQuantity(
                        item.id,
                        newQuantity
                      );
                    }
                  }
                }}
                onKeyDown={(event) => {
                  // Allow all control keys and navigation
                  if (
                    event.ctrlKey ||
                    event.metaKey ||
                    event.altKey
                  )
                    return;

                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "Escape",
                    "Enter",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                    ".",
                    "Decimal", // Explicitly allow decimal keys
                  ];

                  const isNumber = /[0-9]/.test(
                    event.key
                  );
                  const isDot =
                    event.key === "." ||
                    event.key === "Decimal";
                  const currentValue = (
                    event.target as HTMLInputElement
                  ).value;
                  const hasDecimal =
                    currentValue.includes(".");

                  // Allow if it's a number, allowed key, or decimal (if no decimal exists)
                  if (
                    !isNumber &&
                    !allowedKeys.includes(
                      event.key
                    ) &&
                    !(isDot && !hasDecimal)
                  ) {
                    event.preventDefault();
                  }
                }}
                defaultValue={item.quantity || 1} // Use defaultValue instead of value
                sx={{
                  width: "80px",
                  height: "35px",
                }}
                type="text"
                inputProps={{
                  inputMode: "decimal",
                  pattern: "[0-9]*[.]?[0-9]*",
                  "aria-label": "יחידת מידה",
                }}
                id="unit-of-measure"
                endAdornment={
                  <InputAdornment position="end">
                    יח'
                  </InputAdornment>
                }
                aria-describedby="unit of measure"
              />
            </FormControl>
          )}
          <DeleteOutlinedIcon />
        </div>
      ))}
    </div>
  );
}
