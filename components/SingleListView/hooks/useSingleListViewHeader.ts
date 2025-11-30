import { useContext, useState } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { TRANSLATIONS } from "@/configuration/constants";

export function useSingleListViewHeader() {
  const {
    activeList,
    activeListId,
    setActiveListId,
  } = useContext(ShopSmartContext);
  

  return {
    activeList,
    activeListId,
    setActiveListId,
  };
}