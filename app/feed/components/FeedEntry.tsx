import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XCircleIcon } from "lucide-react";

type FeedEntryProps = {
  entry: {
    feedTime: string;
    amount: string;
    wetDiaper: boolean;
    pooped: boolean;
    solidFoods: string[];
    id: number;
  };
  index: number;
  onDelete: (index: number) => void;
  onUpdate: (
    index: number,
    update: Partial<{
      feedTime: string;
      amount: string;
      wetDiaper: boolean;
      pooped: boolean;
      solidFoods: string[];
    }>
  ) => void;
  currentSolidFood: string;
  onSolidFoodChange: (value: string) => void;
  onSolidFoodDelete: (entryIndex: number, foodIndex: number) => void;
  isLastEntry: boolean;
  onAddEntry: () => void;
};

export function FeedEntry({
  entry,
  index,
  onDelete,
  onUpdate,
  currentSolidFood,
  onSolidFoodChange,
  onSolidFoodDelete,
  isLastEntry,
  onAddEntry,
}: FeedEntryProps) {
  return (
    <div className="space-y-4 relative">
      {index > 0 && (
        <div className="absolute -top-2 -right-2 -mt-1">
          <Button
            type="button"
            onClick={() => onDelete(index)}
            variant={"ghost"}
            size={"icon"}
            className="text-red-500 hover:text-red-600"
          >
            <XCircleIcon />
          </Button>
        </div>
      )}
      <div className="flex justify-between w-full gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Time</label>
          <Input
            type="time"
            value={entry.feedTime}
            onChange={(e) => onUpdate(index, { feedTime: e.target.value })}
            required
            step="600"
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Amount (ml)</label>
          <Input
            type="number"
            value={entry.amount}
            onChange={(e) => onUpdate(index, { amount: e.target.value })}
            required
            min="0"
            step="10"
            className="w-full"
          />
        </div>
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium mb-1">Solid Foods</label>
        <Input
          type="text"
          value={currentSolidFood}
          onChange={(e) => onSolidFoodChange(e.target.value)}
          placeholder="Type and press comma to add"
          className="w-full mb-2"
        />
        <div className="flex flex-wrap gap-2">
          {entry.solidFoods?.map((food, foodIndex) => (
            <div
              key={foodIndex}
              className="flex items-center bg-pink-100 text-pink-800 rounded-full px-3 py-1 text-sm"
            >
              <span>{food}</span>
              <button
                type="button"
                onClick={() => onSolidFoodDelete(index, foodIndex)}
                className="ml-2 text-pink-600 hover:text-pink-800"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={entry.wetDiaper}
            onChange={(e) => onUpdate(index, { wetDiaper: e.target.checked })}
            className="rounded"
          />
          <span>Wet Diaper</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={entry.pooped}
            onChange={(e) => onUpdate(index, { pooped: e.target.checked })}
            className="rounded"
          />
          <span>Pooped</span>
        </label>
      </div>
      {isLastEntry && (
        <Button
          variant={"secondary"}
          type="button"
          onClick={onAddEntry}
          className="w-full"
        >
          Add Another Entry
        </Button>
      )}
    </div>
  );
}
