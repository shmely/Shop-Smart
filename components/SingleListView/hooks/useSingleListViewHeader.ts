import { useContext, useState } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { TRANSLATIONS } from "@/configuration/constants";

export function useSingleListViewHeader() {
  const {
    activeList,
    lang,
    activeListId,
    setActiveListId,
  } = useContext(ShopSmartContext);

  const t = TRANSLATIONS[lang];
  const [showSettings, setShowSettings] = useState(false);

  const handleShare = () => {
    const url = `${window.location.origin}/#list/${activeListId}`;
    navigator.clipboard.writeText(url);
    alert(`${TRANSLATIONS[lang].copied}\n${url}`);
  };

  return {
    activeList,
    t,
    activeListId,
    setActiveListId,
    showSettings,
    setShowSettings,
    handleShare,
  };
}