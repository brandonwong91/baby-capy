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

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
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
        <div className="flex justify-center">
          <Button
            onClick={() => router.push("/feed")}
            // className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Feed
          </Button>
        </div>
      </div>
    </main>
  );
}
