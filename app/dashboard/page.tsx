"use client";

import { useEffect, useState } from "react";
import CountUp from "react-countup";
import {
  differenceInDays,
  differenceInWeeks,
  differenceInYears,
  differenceInMonths,
} from "date-fns";
import { useRouter } from "next/navigation";
import ReactConfetti from "react-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FeedStats = {
  highestVolume: { amount: number; date: string };
  lowestVolume: { amount: number; date: string };
  highestVolumeLastWeek: { amount: number; date: string };
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [stats, setStats] = useState<FeedStats | null>(null);
  const [solidFoods, setSolidFoods] = useState<
    Array<{ food: string; timestamp: string }>
  >([]);
  const [editingFood, setEditingFood] = useState<{
    food: string;
    timestamp: string;
  } | null>(null);
  const [originalFood, setOriginalFood] = useState<string>("");

  const handleSaveFood = async () => {
    if (!editingFood) return;
    try {
      const response = await fetch(`/api/feeds/solid-foods`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldFood: originalFood,
          newFood: editingFood.food.trim().toLowerCase(),
        }),
      });

      if (response.ok) {
        // Refresh the solid foods list after successful update
        const refreshResponse = await fetch("/api/feeds/solid-foods");
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setSolidFoods(data.solidFoods);
        }
        setEditingFood(null);
        setOriginalFood("");
      }
    } catch (error) {
      console.error("Failed to update solid food:", error);
    }
  };
  const [lastPoop, setLastPoop] = useState<{
    days: number;
    hours: number;
    message: string;
    feedTime?: string;
    showDetails?: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const targetDate = new Date("2024-05-09");
  const currentDate = new Date();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isDateAuthenticated");
    if (isAuthenticated !== "true") {
      router.push("/");
    }
    setMounted(true);

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, poopResponse, solidFoodsResponse] =
          await Promise.all([
            fetch("/api/feeds/stats"),
            fetch("/api/feeds/last-poop"),
            fetch("/api/feeds/solid-foods"),
          ]);

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch feed statistics");
        }
        if (!poopResponse.ok) {
          throw new Error("Failed to fetch last poop time");
        }
        if (!solidFoodsResponse.ok) {
          throw new Error("Failed to fetch solid foods");
        }

        const statsData = await statsResponse.json();
        const poopData = await poopResponse.json();
        const solidFoodsData = await solidFoodsResponse.json();
        console.log("solid fe", solidFoodsData);
        setStats(statsData);
        setLastPoop(poopData);
        setSolidFoods(solidFoodsData.solidFoods);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log("solid outside useEffect", solidFoods);
  const calculateDaysUntilBirthday = () => {
    const today = new Date();
    const birthday = new Date(today.getFullYear(), 4, 9); // May is month 4 (0-based)

    if (today > birthday) {
      // If we've passed this year's birthday, calculate for next year
      birthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = birthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const countdownDays = calculateDaysUntilBirthday();
  const years = differenceInYears(currentDate, targetDate);
  const months = differenceInMonths(currentDate, targetDate);
  const weeks = differenceInWeeks(currentDate, targetDate);
  const days = differenceInDays(currentDate, targetDate);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-16 lg:p-24">
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
      />
      <div className="w-full max-w-2xl p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-8 p-6 bg-blue-50 rounded-lg text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-blue-800">
            Countdown to Brad&apos;s Birthday
          </h2>
          <div className="text-4xl sm:text-6xl font-bold text-blue-600">
            <CountUp end={Math.abs(countdownDays)} duration={2.5} />
            {Math.abs(countdownDays) === 1 ? " day" : " days"}
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-8">
          Brad is this old now!
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
              Years
            </h2>
            <CountUp
              end={Math.abs(years)}
              duration={2.5}
              className="text-2xl sm:text-4xl font-bold"
            />
          </div>
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
              Months
            </h2>
            <CountUp
              end={Math.abs(months)}
              duration={2.5}
              className="text-2xl sm:text-4xl font-bold"
            />
          </div>
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
              Weeks
            </h2>
            <CountUp
              end={Math.abs(weeks)}
              duration={2.5}
              className="text-2xl sm:text-4xl font-bold"
            />
          </div>
          <div className="text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
              Days
            </h2>
            <CountUp
              end={Math.abs(days)}
              duration={2.5}
              className="text-2xl sm:text-4xl font-bold"
            />
          </div>
        </div>
        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-blue-800">
            Feeding Statistics
          </h2>
          {error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : loading ? (
            <div className="text-center p-4">Loading statistics...</div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Highest Volume Ever
                </h3>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.highestVolume.amount}ml
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.highestVolume.date}
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Lowest Volume Ever
                </h3>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.lowestVolume.amount}ml
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.lowestVolume.date}
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">
                  Highest Volume (Last 7 Days)
                </h3>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.highestVolumeLastWeek.amount}ml
                  </div>
                  <div className="text-sm text-gray-500">
                    {stats.highestVolumeLastWeek.date}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div className="mb-8 p-6 bg-pink-50 rounded-lg text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-pink-800">
            Time Since Last Poop
          </h2>
          {lastPoop && (
            <button
              onClick={() =>
                setLastPoop((prev) => ({
                  ...prev!,
                  showDetails: !prev?.showDetails,
                }))
              }
              className="w-full text-center focus:outline-none"
            >
              <div className="text-4xl sm:text-6xl font-bold text-pink-600">
                {lastPoop.days} days {lastPoop.hours} hours
              </div>
              {lastPoop.showDetails && lastPoop.feedTime && (
                <div className="mt-4 text-lg text-pink-500">
                  Last pooped on: {new Date(lastPoop.feedTime).toLocaleString()}
                </div>
              )}
            </button>
          )}
        </div>
        <div className="mb-8 p-6 bg-pink-50 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-pink-800">
            Recent Solid Foods
          </h2>
          {error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : loading ? (
            <div className="text-center p-4">Loading solid foods...</div>
          ) : solidFoods.length > 0 ? (
            <div className="space-y-4 h-[400px] overflow-auto">
              {solidFoods.map(({ food, timestamp }) => (
                <div
                  key={`${food}-${timestamp}`}
                  className="bg-white p-4 rounded-lg shadow"
                >
                  <div className="flex justify-between items-center">
                    {editingFood?.food === food ? (
                      <div className="flex-1">
                        <Input
                          type="text"
                          value={editingFood.food}
                          onChange={(e) =>
                            setEditingFood({
                              ...editingFood,
                              food: e.target.value,
                            })
                          }
                          className="text-lg font-medium text-pink-600 pr-4"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveFood();
                            } else if (e.key === "Escape") {
                              setEditingFood(null);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-lg font-medium text-pink-600">
                        {food}
                      </span>
                    )}
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-sm text-gray-500">
                        {new Date(timestamp).toLocaleString()}
                      </span>
                      {editingFood?.food === food ? (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveFood}
                            className="text-green-600 hover:text-green-700"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingFood(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOriginalFood(food);
                            setEditingFood({ food, timestamp });
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No solid foods recorded
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <Button onClick={() => router.push("/feed")}>Go to Feed</Button>
        </div>
      </div>
    </main>
  );
}
