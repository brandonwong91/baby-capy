"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import {
  CircleParking,
  Droplet,
  Loader2,
  PencilIcon,
  TrashIcon,
  XCircleIcon,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Feed = {
  id: string;
  feedTime: string;
  amount: number;
  wetDiaper: boolean;
  pooped: boolean;
};

export default function Feed() {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [feedEntries, setFeedEntries] = useState([
    {
      feedTime: "",
      amount: "",
      wetDiaper: false,
      pooped: false,
      id: Date.now(),
    },
  ]);
  const router = useRouter();
  const [editingFeed, setEditingFeed] = useState<Feed | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isDateAuthenticated");
    if (isAuthenticated !== "true") {
      router.push("/");
    }
    setMounted(true);
    fetchFeeds(selectedDate);
  }, [router, selectedDate]);

  const fetchFeeds = async (date: Date) => {
    try {
      const response = await fetch(
        `/api/feeds?date=${format(
          date,
          "yyyy-MM-dd"
        )}&timezoneOffset=${date.getTimezoneOffset()}`
      );
      const data = await response.json();
      setFeeds(data);
    } catch (error) {
      console.error("Failed to fetch feeds:", error);
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
            id: Date.now(),
          },
        ]);
        fetchFeeds(selectedDate);
      }
    } catch (error) {
      console.error("Failed to create feed:", error);
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
      const response = await fetch(`/api/feeds?id=${feed.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedTime: feed.feedTime,
          amount: feed.amount,
          wetDiaper: feed.wetDiaper,
          pooped: feed.pooped,
        }),
      });
      if (response.ok) {
        setEditingFeed(null);
        fetchFeeds(selectedDate);
      }
    } catch (error) {
      console.error("Failed to update feed:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
                <div key={entry.id} className="space-y-4 relative">
                  {index > 0 && (
                    <div className="absolute -top-2 -right-2 -mt-1">
                      <Button
                        type="button"
                        onClick={() => {
                          setFeedEntries((entries) =>
                            entries.filter((_, i) => i !== index)
                          );
                        }}
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
                      <label className="block text-sm font-medium mb-1">
                        Time
                      </label>
                      <Input
                        type="time"
                        value={entry.feedTime}
                        onChange={(e) => {
                          setFeedEntries((entries) =>
                            entries.map((item, i) =>
                              i === index
                                ? { ...item, feedTime: e.target.value }
                                : item
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
                        value={entry.amount}
                        onChange={(e) => {
                          setFeedEntries((entries) =>
                            entries.map((item, i) =>
                              i === index
                                ? { ...item, amount: e.target.value }
                                : item
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
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={entry.wetDiaper}
                        onChange={(e) => {
                          setFeedEntries((entries) =>
                            entries.map((item, i) =>
                              i === index
                                ? { ...item, wetDiaper: e.target.checked }
                                : item
                            )
                          );
                        }}
                        className="rounded"
                      />
                      <span>Wet Diaper</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={entry.pooped}
                        onChange={(e) => {
                          setFeedEntries((entries) =>
                            entries.map((item, i) =>
                              i === index
                                ? { ...item, pooped: e.target.checked }
                                : item
                            )
                          );
                        }}
                        className="rounded"
                      />
                      <span>Pooped</span>
                    </label>
                  </div>
                  {index === feedEntries.length - 1 && (
                    <Button
                      variant={"secondary"}
                      type="button"
                      onClick={() => {
                        const lastEntry = feedEntries[feedEntries.length - 1];
                        setFeedEntries((entries) => [
                          ...entries,
                          {
                            feedTime: lastEntry.feedTime,
                            amount: lastEntry.amount,
                            wetDiaper: lastEntry.wetDiaper,
                            pooped: lastEntry.pooped,
                            id: Date.now(),
                          },
                        ]);
                      }}
                      className="w-full"
                    >
                      Add Another Entry
                    </Button>
                  )}
                </div>
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Daily Feeding Chart</h2>
            <Line
              data={{
                labels: feeds.map((feed) =>
                  format(new Date(feed.feedTime), "HH:mm")
                ),
                datasets: [
                  {
                    label: "Milk Amount (ml)",
                    data: feeds.map((feed) => feed.amount),
                    borderColor: "#FF8BA7",
                    backgroundColor: "rgba(255, 139, 167, 0.2)",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: true,
                    text: `Feeding Pattern - ${format(
                      selectedDate,
                      "MMM dd, yyyy"
                    )}`,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Amount (ml)",
                    },
                  },
                },
              }}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              Daily Feeds ({feeds.reduce((sum, feed) => sum + feed.amount, 0)}
              ml)
            </h2>
            <div className="space-y-4">
              {feeds.length === 0 ? (
                <p className="text-gray-500">No feeds recorded for this day</p>
              ) : (
                feeds.map((feed) => (
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
                                  const updatedFeeds = feeds.map((f) =>
                                    f.id === feed.id
                                      ? {
                                          ...f,
                                          feedTime: `${format(
                                            selectedDate,
                                            "yyyy-MM-dd"
                                          )}T${e.target.value}`,
                                        }
                                      : f
                                  );
                                  setFeeds(updatedFeeds);
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
                                  const updatedFeeds = feeds.map((f) =>
                                    f.id === feed.id
                                      ? {
                                          ...f,
                                          amount: parseInt(e.target.value) || 0,
                                        }
                                      : f
                                  );
                                  setFeeds(updatedFeeds);
                                }}
                                required
                                min="0"
                                step="10"
                                className="w-full"
                              />
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
                              onClick={() => handleSaveEdit(feed)}
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
                            <div className="flex space-x-4 text-sm">
                              {feed.wetDiaper && (
                                <span className={"text-blue-500 flex gap-1"}>
                                  <p>Wet Diaper</p>
                                  <Droplet className="h-5 w-5" />
                                </span>
                              )}
                              {feed.pooped && (
                                <span className={"text-amber-800 flex gap-1"}>
                                  <p>Pooped</p>
                                  <CircleParking className="h-5 w-5" />
                                </span>
                              )}
                            </div>
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
