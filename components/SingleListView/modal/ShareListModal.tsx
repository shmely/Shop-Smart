import { ShopSmartContext } from "@/context/ShopSmartContext";
import { db } from "@/firebase";
import {
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useContext, useState } from "react";

interface Props {
  setIsOpen: (isOpen: boolean) => void;
}

export default function ShareListModal({
  setIsOpen,
}: Props) {
  const {
    activeList,
    addListMember,
    addListMemberByEmail,
  } = useContext(ShopSmartContext);
  const [email, setEmail] = useState<string>("");

  const handleAddMember = async () => {
    if (!activeList) return;
    try {
      await addListMemberByEmail(email);
      setIsOpen(false);
    } catch (error) {
      console.error(
        "Error adding list member:",
        error
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-center px-6 py-6 border-b">
          <FormControl fullWidth>
            <InputLabel htmlFor="my-input">
              Email address
            </InputLabel>
            <Input
              id="my-input"
              aria-describedby="my-helper-text"
              dir="ltr"
              onChange={(e) =>
                setEmail(e.target.value)
              }
              value={email}
            />
            <FormHelperText id="my-helper-text">
              We'll never share your email.
            </FormHelperText>
          </FormControl>
        </div>
        <div className="p-2 max-h-60 overflow-y-auto"></div>
        <div className="p-4 bg-gray-50 rounded-b-2xl text-right">
          <button
            onClick={() => handleAddMember()}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-100"
          >
            Share
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
