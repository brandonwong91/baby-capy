import { NextResponse } from "next/server";
import { PrismaClient, Feed } from "@prisma/client";
import { format, subDays } from "date-fns";

const prisma = new PrismaClient();

interface DailyTotal {
  date: string;
  total: number;
}

export async function GET() {
  try {
    // Get all feeds grouped by date
    const allFeeds = await prisma.feed.findMany();
    if (!allFeeds.length) {
      return NextResponse.json({
        highestVolume: { amount: 0, date: format(new Date(), "MMM d, yyyy") },
        lowestVolume: { amount: 0, date: format(new Date(), "MMM d, yyyy") },
        highestVolumeLastWeek: {
          amount: 0,
          date: format(new Date(), "MMM d, yyyy"),
        },
        lowestVolumeLastWeek: {
          amount: 0,
          date: format(new Date(), "MMM d, yyyy"),
        },
      });
    }

    const feedsByDate = allFeeds.reduce<Record<string, Feed[]>>((acc, feed) => {
      const date = format(new Date(feed.feedTime), "yyyy-MM-dd");
      if (!acc[date]) acc[date] = [];
      acc[date].push(feed);
      return acc;
    }, {});

    // Calculate daily totals
    const dailyTotals: DailyTotal[] = Object.entries(feedsByDate).map(
      ([date, feeds]) => ({
        date,
        total: feeds.reduce((sum, feed) => sum + feed.amount, 0),
      })
    );

    if (!dailyTotals.length) {
      throw new Error("No daily totals calculated");
    }

    // Find highest and lowest volumes ever
    const highestVolume = dailyTotals.reduce((max, current) =>
      current.total > max.total ? current : max
    );
    const lowestVolume = dailyTotals.reduce((min, current) =>
      current.total < min.total ? current : min
    );

    // Calculate highest volume in the last 7 days
    const sevenDaysAgo = subDays(new Date(), 7);
    const recentDailyTotals = dailyTotals.filter(
      (day) => new Date(day.date) >= sevenDaysAgo
    );

    const highestVolumeLastWeek =
      recentDailyTotals.length > 0
        ? recentDailyTotals.reduce((max, current) =>
            current.total > max.total ? current : max
          )
        : { date: format(new Date(), "yyyy-MM-dd"), total: 0 };

    const lowestVolumeLastWeek =
      recentDailyTotals.length > 0
        ? recentDailyTotals.reduce((min, current) =>
            current.total < min.total ? current : min
          )
        : { date: format(new Date(), "yyyy-MM-dd"), total: 0 };

    const response = {
      highestVolume: {
        amount: highestVolume.total,
        date: format(new Date(highestVolume.date), "MMM d, yyyy"),
      },
      lowestVolume: {
        amount: lowestVolume.total,
        date: format(new Date(lowestVolume.date), "MMM d, yyyy"),
      },
      highestVolumeLastWeek: {
        amount: highestVolumeLastWeek.total,
        date: format(new Date(highestVolumeLastWeek.date), "MMM d, yyyy"),
      },
      lowestVolumeLastWeek: {
        amount: lowestVolumeLastWeek.total,
        date: format(new Date(lowestVolumeLastWeek.date), "MMM d, yyyy"),
      },
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching feed stats:", error);
    const defaultDate = format(new Date(), "MMM d, yyyy");
    const errorResponse = {
      error: "Failed to fetch feed statistics",
      highestVolume: { amount: 0, date: defaultDate },
      lowestVolume: { amount: 0, date: defaultDate },
      highestVolumeLastWeek: { amount: 0, date: defaultDate },
      lowestVolumeLastWeek: { amount: 0, date: defaultDate },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
