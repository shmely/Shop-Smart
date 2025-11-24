import SingleListViewFooter from "./SingleListViewFooter";
import SingleListViewMain from "./SingleListViewMain";
import { NotificationToast } from "../NotificationToast";
import { useContext, useState } from "react";
import { ShopSmartContext } from "@/context/ShopSmartContext";
import { Notification } from "@/types";
import SingleListViewHeader from "./SingleListViewHeader";

export default function SingleListView() {
  const [notification, setNotification] =
    useState<Notification | null>(null);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SingleListViewHeader />
      <SingleListViewMain />
      <SingleListViewFooter />
    </div>
  );
}
