import { useContext } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { TRANSLATIONS } from "@/configuration/constants";

export function useSingleListViewHeader() {
  const {
    activeList,
    lang,
    activeListId,
    setActiveListId,
  } = useContext(ShopSmartContext);

  const handleShare = () => {
    const url = `${window.location.origin}/#list/${activeListId}`;
    navigator.clipboard.writeText(url);
    alert(`${TRANSLATIONS[lang].copied}\n${url}`);
  };

  return {
    activeList,
    activeListId,
    setActiveListId,
    handleShare,
  };
}