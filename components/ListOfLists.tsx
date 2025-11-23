import { ShopSmartContext } from "@/context/ShopSmartContext";

export default function ListOfLists() {
  const { lists } = useContext(ShopSmartContext);

  return (
    <div>
      <h2>Your Shopping Lists</h2>
      <ul>
        {lists.map((list) => (
          <li key={list.id}>{list.name}</li>
        ))}
      </ul>
    </div>
  );
}
import { useContext } from "react";