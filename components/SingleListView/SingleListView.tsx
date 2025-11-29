import SingleListViewFooter from "./SingleListViewFooter";
import SingleListViewMain from "./SingleListViewMain";
import SingleListViewHeader from "./SingleListViewHeader";

export default function SingleListView() {
  return (
    <div className="flex flex-col h-screen">
      <SingleListViewMain />
      <SingleListViewFooter />
    </div>
  );
}
