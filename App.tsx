import React, {
  useEffect,
  useContext,
} from "react";
import { Language } from "./types";

import Login from "./components/Login";
import { ShopSmartContext } from "./context/ShopSmartContext";
import ListOfLists from "./components/ListOfLists";
import {} from "./configuration/icons";
import SingleListView from "./components/SingleListView/SingleListView";
import { NotificationToast } from "./components/NotificationToast";

// --- Main App Component ---
export default function App() {
  // --- State ---
  const {
    lang,
    user,
    activeListId,
    setNotification,
  } = useContext(ShopSmartContext);

  useEffect(() => {
    document.documentElement.dir =
      lang === Language.HE ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!user ? (
        <Login />
      ) : !activeListId ? (
        <ListOfLists />
      ) : (
        <SingleListView />
      )}
      <NotificationToast
        onDismiss={() => setNotification(null)}
      />
    </div>
  );
}
