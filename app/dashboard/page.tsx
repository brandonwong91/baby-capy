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

  const years = differenceInYears(currentDate, targetDate);
  const months = differenceInMonths(currentDate, targetDate);
  const weeks = differenceInWeeks(currentDate, targetDate);
  const days = differenceInDays(currentDate, targetDate);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <ReactConfetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
      />
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">
          Time since Brad&apos;s birthday
        </h1>
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Years</h2>
            <CountUp
              end={Math.abs(years)}
              duration={2.5}
              className="text-4xl font-bold"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Months</h2>
            <CountUp
              end={Math.abs(months)}
              duration={2.5}
              className="text-4xl font-bold"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Weeks</h2>
            <CountUp
              end={Math.abs(weeks)}
              duration={2.5}
              className="text-4xl font-bold"
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Days</h2>
            <CountUp
              end={Math.abs(days)}
              duration={2.5}
              className="text-4xl font-bold"
            />
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/feed")}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Go to Feed
          </button>
        </div>
      </div>
    </main>
  );
}
