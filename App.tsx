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

// --- Main App Component ---
export default function App() {
  // --- State ---
  const { lang, user, activeListId } = useContext(
    ShopSmartContext
  );

  useEffect(() => {
    document.documentElement.dir =
      lang === Language.HE ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  if (!user) return <Login />;

  // home screen list of lists ---
  if (!activeListId) {
    return <ListOfLists />;
  }

  // --- Single List View ---
  return <SingleListView />;
}
