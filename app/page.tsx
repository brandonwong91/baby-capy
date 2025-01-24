"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useRouter } from "next/navigation";

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
      if (
        inputDate.getDate() === 9 &&
        inputDate.getMonth() === 4 &&
        inputDate.getFullYear() === 2024
      ) {
        localStorage.setItem("isDateAuthenticated", "true");
        router.push("/dashboard");
      }
    }
    setDate(selectedDate);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg justify-items-center">
        <h1 className="text-2xl font-bold text-center mb-6">
          Enter the Capy&apos;s Date
        </h1>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          className="rounded-md border w-fit"
        />
      </div>
    </main>
  );
}
