"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isDateAuthenticated");
    if (isAuthenticated === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const inputDate = new Date(selectedDate);
      checkAndNavigate(inputDate);
    }
    setDate(selectedDate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = new Date(e.target.value);
    if (!isNaN(inputDate.getTime())) {
      setDate(inputDate);
      checkAndNavigate(inputDate);
    }
  };

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const checkAndNavigate = (inputDate: Date) => {
    if (
      inputDate.getDate() === 9 &&
      inputDate.getMonth() === 4 &&
      inputDate.getFullYear() === 2024
    ) {
      setIsAuthenticating(true);
      localStorage.setItem("isDateAuthenticated", "true");
      router.push("/dashboard");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center">
          Enter the Capy&apos;s Date
        </h1>
        <Input
          type="date"
          value={date ? format(date, "yyyy-MM-dd") : ""}
          onChange={handleInputChange}
          className="w-full"
        />
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className={`rounded-md border transition-opacity duration-200 ${
              isAuthenticating ? "opacity-50" : ""
            }`}
            disabled={isAuthenticating}
          />
        </div>
      </div>
    </main>
  );
}
