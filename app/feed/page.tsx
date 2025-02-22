"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  CircleParking,
  Droplet,
  Loader2,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";
import { FeedEntry } from "./components/FeedEntry";
import { FeedPrediction } from "@/types/feed";
import { FeedChart } from "./components/FeedChart";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";

type Feed = {
  id: string;
  feedTime: string;
  amount: number;
  wetDiaper: boolean;
  pooped: boolean;
  solidFoods?: string[];
};

type FeedEntry = {
  feedTime: string;
  amount: string;
  wetDiaper: boolean;
  pooped: boolean;
  solidFoods: string[];
  id: number;
};

export default function Feed() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [nextFeedPrediction, setNextFeedPrediction] =
    useState<FeedPrediction | null>(null);
  const [highestVolumeLastWeek, setHighestVolumeLastWeek] = useState({
    amount: 0,
    date: "",
  });
  const [lowestVolumeLastWeek, setLowestVolumeLastWeek] = useState({
    amount: 0,
    date: "",
  });
  const [feedEntries, setFeedEntries] = useState<
    Array<{
      feedTime: string;
      amount: string;
      wetDiaper: boolean;
      pooped: boolean;
      solidFoods: string[];
      id: number;
    }>
  >([
    {
      feedTime: "",
      amount: "",
      wetDiaper: false,
      pooped: false,
      solidFoods: [],
      id: Date.now(),
    },
  ]);
  const [, setError] = useState("");
  const router = useRouter();
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSolidFood, setCurrentSolidFood] = useState("");
  const [editSolidFood, setEditSolidFood] = useState({
    value: "",
    index: 0,
  });
  const [showPredictionHistory, setShowPredictionHistory] = useState(false);
  const onDelete = (index: number) => {
    setFeedEntries((entries) => entries.filter((_, i) => i !== index));
  };

  const onUpdate = (
    index: number,
    update: Partial<{
      feedTime: string;
      amount: string;
      wetDiaper: boolean;
      pooped: boolean;
      solidFoods: string[];
    }>
  ) => {
    setFeedEntries((entries) =>
      entries.map((item, i) => (i === index ? { ...item, ...update } : item))
    );
  };

  const onSolidFoodChange = (value: string) => {
    setCurrentSolidFood(value);
  };

  const onSolidFoodDelete = (entryIndex: number, foodIndex: number) => {
    setFeedEntries((entries) =>
      entries.map((item, i) =>
        i === entryIndex
          ? {
              ...item,
              solidFoods: item.solidFoods?.filter((_, i) => i !== foodIndex),
            }
          : item
      )
    );
  };

  const onAddEntry = () => {
    const lastEntry = feedEntries[feedEntries.length - 1];
    setFeedEntries((entries) => [
      ...entries,
      {
        feedTime: lastEntry.feedTime,
        amount: lastEntry.amount,
        wetDiaper: lastEntry.wetDiaper,
        pooped: lastEntry.pooped,
        solidFoods: lastEntry.solidFoods ? [...lastEntry.solidFoods] : [],
        id: Date.now(),
      },
    ]);
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isDateAuthenticated");
    if (isAuthenticated !== "true") {
      router.push("/");
    }
    setMounted(true);
    fetchFeeds(selectedDate);
    fetchStats();
    fetchNextFeedPrediction();
  }, [router, selectedDate]);

  const fetchNextFeedPrediction = async () => {
    try {
      const response = await fetch("/api/feeds/next-feed");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.nextFeedIn) {
        setNextFeedPrediction({
          nextFeedIn: {
            hours: data.nextFeedIn.hours,
            minutes: data.nextFeedIn.minutes,
          },
          message: data.message,
          predictionHistory: data.predictionHistory,
        });
      } else {
        setNextFeedPrediction(null);
      }
    } catch (error) {
      console.error("Failed to fetch next feed prediction:", error);
      setError("Failed to fetch next feed prediction. Please try again later.");
      setNextFeedPrediction(null);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/feeds/stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHighestVolumeLastWeek(data.highestVolumeLastWeek);
      setLowestVolumeLastWeek(data.lowestVolumeLastWeek);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setError("Failed to fetch feeding statistics. Please try again later.");
    }
  };

  const fetchFeeds = async (date: Date) => {
    try {
      const response = await fetch(
        `/api/feeds?date=${format(
          date,
          "yyyy-MM-dd"
        )}&timezoneOffset=${date.getTimezoneOffset()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeeds(data);
      setError("");
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
      setError("Failed to fetch feeding data. Please try again later.");
      setFeeds([]);
    }
  };

  const getLocalFeedTime = (selectedDate: Date, timeString: string): Date => {
    const feedTimeDate = new Date(
      `${format(selectedDate, "yyyy-MM-dd")}T${timeString}`
    );
    return new Date(
      feedTimeDate.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const promises = feedEntries.map((entry) => {
        const localFeedTime = getLocalFeedTime(selectedDate, entry.feedTime);
        return fetch("/api/feeds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedTime: localFeedTime.toISOString(),
            amount: parseInt(entry.amount),
            wetDiaper: entry.wetDiaper,
            pooped: entry.pooped,
            solidFoods: entry.solidFoods,
          }),
        });
      });

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        setFeedEntries([
          {
            feedTime: "",
            amount: "",
            wetDiaper: false,
            pooped: false,
            solidFoods: [],
            id: Date.now(),
          },
        ]);
        setCurrentSolidFood("");
        fetchFeeds(selectedDate);
        fetchNextFeedPrediction();
        fetchStats();
      } else {
        setError("Some feed entries failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create feed:", error);
      setError("Failed to save feed entries. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feed?")) return;
    setIsDeleting(id);
    try {
      const response = await fetch(`/api/feeds?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFeeds(selectedDate);
      }
    } catch (error) {
      console.error("Failed to delete feed:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSaveEdit = async (feed: Feed) => {
    setIsSaving(true);
    try {
      const localFeedTime = getLocalFeedTime(
        selectedDate,
        format(new Date(feed.feedTime), "HH:mm")
      );
      const response = await fetch(`/api/feeds?id=${feed.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedTime: localFeedTime.toISOString(),
          amount: feed.amount,
          wetDiaper: feed.wetDiaper,
          pooped: feed.pooped,
          solidFoods: feed.solidFoods || [],
        }),
      });
      if (response.ok) {
        setEditingFeed(null);
        setEditSolidFood({ value: "", index: 0 });
        fetchFeeds(selectedDate);
      }
    } catch (error) {
      console.error("Failed to update feed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const [solidFoodSuggestions, setSolidFoodSuggestions] = useState<string[]>(
    []
  );

  useEffect(() => {
    const fetchSolidFoods = async () => {
      try {
        const response = await fetch("/api/feeds/solid-foods");
        if (!response.ok) throw new Error("Failed to fetch solid foods");
        const data: { solidFoods: Array<{ food: string }> } =
          await response.json();
        const uniqueFoods = Array.from(
          new Set(
            data.solidFoods
              .filter((item) => item.food && item.food.trim())
              .map((item) => item.food.trim().toLowerCase())
          )
        ).sort() as string[];
        setSolidFoodSuggestions(uniqueFoods);
      } catch (error) {
        console.error("Error fetching solid foods:", error);
      }
    };
    fetchSolidFoods();
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6 place-text-center">
            <h2 className="text-2xl font-bold mb-4 self-start">Select Date</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border w-fit"
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Add New Feed</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {feedEntries.map((entry, index) => (
                <FeedEntry
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  currentSolidFood={currentSolidFood}
                  onSolidFoodChange={onSolidFoodChange}
                  onSolidFoodDelete={onSolidFoodDelete}
                  isLastEntry={index === feedEntries.length - 1}
                  onAddEntry={onAddEntry}
                />
              ))}
              <Button
                variant={"default"}
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Feed"
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="gap-6 flex flex-col-reverse md:flex-col">
          <FeedChart
            feeds={feeds}
            selectedDate={selectedDate}
            highestVolumeLastWeek={highestVolumeLastWeek}
            lowestVolumeLastWeek={lowestVolumeLastWeek}
          />

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              Daily Feeds ({feeds.reduce((sum, feed) => sum + feed.amount, 0)}{" "}
              ml)
              {nextFeedPrediction && (
                <div className="space-y-2">
                  <div
                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() =>
                      setShowPredictionHistory(!showPredictionHistory)
                    }
                  >
                    {nextFeedPrediction.message}
                  </div>

                  {showPredictionHistory &&
                    nextFeedPrediction.predictionHistory?.map((feed, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-gray-600">
                          {feed.date} - Predicted: {feed.predictedTime}
                          {feed.actualTime && `, Actual: ${feed.actualTime}`}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </h2>
            <div className="space-y-4">
              {feeds.length === 0 ? (
                <p className="text-gray-500">No feeds recorded for this day</p>
              ) : (
                feeds.map((feed, index) => (
                  <div
                    key={feed.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      {editingFeed?.id === feed.id ? (
                        <div className="space-y-4 w-full">
                          <div className="flex justify-between w-full gap-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium mb-1">
                                Time
                              </label>
                              <Input
                                type="time"
                                value={format(new Date(feed.feedTime), "HH:mm")}
                                onChange={(e) => {
                                  const updatedFeed = {
                                    ...feed,
                                    feedTime: new Date(
                                      `${format(selectedDate, "yyyy-MM-dd")}T${
                                        e.target.value
                                      }`
                                    ).toISOString(),
                                  };
                                  setEditingFeed(updatedFeed);
                                  setFeeds((prevFeeds) =>
                                    prevFeeds.map((f) =>
                                      f.id === feed.id ? updatedFeed : f
                                    )
                                  );
                                }}
                                required
                                step="600"
                                className="w-full"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium mb-1">
                                Amount (ml)
                              </label>
                              <Input
                                type="number"
                                value={feed.amount}
                                onChange={(e) => {
                                  const updatedFeed = {
                                    ...feed,
                                    amount: parseInt(e.target.value) || 0,
                                  };
                                  setEditingFeed(updatedFeed);
                                  setFeeds((prevFeeds) =>
                                    prevFeeds.map((f) =>
                                      f.id === feed.id ? updatedFeed : f
                                    )
                                  );
                                }}
                                required
                                min="0"
                                step="10"
                                className="w-full"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">
                              Solid Foods
                            </label>
                            <Combobox
                              value={editSolidFood.value}
                              onChange={(value) => {
                                setEditSolidFood({
                                  value,
                                  index,
                                });
                                if (
                                  value.endsWith(",") ||
                                  solidFoodSuggestions.includes(
                                    value.toLowerCase()
                                  )
                                ) {
                                  const newFood = value.endsWith(",")
                                    ? value.slice(0, -1).trim().toLowerCase()
                                    : value.toLowerCase();
                                  if (newFood && editingFeed) {
                                    const updatedFeed = {
                                      ...editingFeed,
                                      solidFoods: [
                                        ...(editingFeed.solidFoods || []),
                                        newFood,
                                      ].filter(
                                        (food, index, array) =>
                                          array.indexOf(food) === index
                                      ),
                                    };
                                    setEditingFeed(updatedFeed);
                                    setFeeds((prevFeeds) =>
                                      prevFeeds.map((feed) =>
                                        feed.id === editingFeed.id
                                          ? updatedFeed
                                          : feed
                                      )
                                    );
                                  }
                                  setEditSolidFood({
                                    value: "",
                                    index,
                                  });
                                }
                              }}
                              options={solidFoodSuggestions}
                              placeholder="Select or type a food item"
                              emptyMessage="No foods found"
                              isSelected={(option) =>
                                editingFeed?.solidFoods?.includes(
                                  option.toLowerCase()
                                )
                              }
                            />
                            <div className="flex flex-wrap gap-2">
                              {editingFeed?.solidFoods?.map(
                                (food, foodIndex) => (
                                  <div
                                    key={foodIndex}
                                    className="flex items-center bg-pink-100 text-pink-800 rounded-full px-3 py-1 text-sm"
                                  >
                                    <span>{food}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingFeed((prev) => ({
                                          ...prev!,
                                          solidFoods: prev!.solidFoods?.filter(
                                            (_, i) => i !== foodIndex
                                          ),
                                        }));
                                      }}
                                      className="ml-2 text-pink-600 hover:text-pink-800"
                                    >
                                      <XCircleIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={feed.wetDiaper}
                                onChange={(e) => {
                                  const updatedFeeds = feeds.map((f) =>
                                    f.id === feed.id
                                      ? { ...f, wetDiaper: e.target.checked }
                                      : f
                                  );
                                  setFeeds(updatedFeeds);
                                }}
                                className="rounded"
                              />
                              <span>Wet Diaper</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={feed.pooped}
                                onChange={(e) => {
                                  const updatedFeeds = feeds.map((f) =>
                                    f.id === feed.id
                                      ? { ...f, pooped: e.target.checked }
                                      : f
                                  );
                                  setFeeds(updatedFeeds);
                                }}
                                className="rounded"
                              />
                              <span>Pooped</span>
                            </label>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleSaveEdit(editingFeed)}
                              variant={"secondary"}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save"
                              )}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingFeed(null);
                                fetchFeeds(selectedDate);
                              }}
                              variant={"destructive"}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <p className="font-medium">
                              Time: {format(new Date(feed.feedTime), "HH:mm")}
                            </p>
                            <p>Amount: {feed.amount}ml</p>
                            <div className="flex md:space-x-4 text-sm md:flex-row flex-col">
                              {feed.wetDiaper && (
                                <div className={"text-blue-500 flex gap-1"}>
                                  <p>Wet Diaper</p>
                                  <Droplet className="h-5 w-5" />
                                </div>
                              )}
                              {feed.pooped && (
                                <div className={"text-amber-800 flex gap-1"}>
                                  <p>Pooped</p>
                                  <CircleParking className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            {feed.solidFoods && feed.solidFoods.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {feed.solidFoods.map((food, index) => (
                                  <div
                                    key={index}
                                    className="bg-pink-100 text-pink-800 rounded-full px-3 py-1 text-sm"
                                  >
                                    {food}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => setEditingFeed(feed)}
                              variant={"outline"}
                            >
                              <PencilIcon />
                            </Button>
                            <Button
                              onClick={() => handleDelete(feed.id)}
                              variant={"destructive"}
                              disabled={isDeleting === feed.id}
                            >
                              {isDeleting === feed.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <TrashIcon />
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
