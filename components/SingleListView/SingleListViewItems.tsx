import { ListItem } from '@/model/types';
import { ViewItem } from './ViewItem';

interface Props {
  listId: string;
  items: ListItem[];
}
export default function SingleListViewItems({ items, listId }: Props) {
  return (
    <div className="divide-y  divide-gray-100 ps-6">
      {items.map((item) => (
        <ViewItem key={item.id} item={item} listId={listId} />
      ))}
    </div>
  );
}
