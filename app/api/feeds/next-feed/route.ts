import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Get today's feeds to determine which feed number we're on
    const todayFeeds = await prisma.feed.findMany({
      where: {
        feedTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      orderBy: {
        feedTime: "asc",
      },
    });

    // Get all feeds from the last 7 days
    const allFeeds = await prisma.feed.findMany({
      where: {
        feedTime: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        feedTime: "asc",
      },
    });

    if (allFeeds.length === 0) {
      return NextResponse.json({
        nextFeedIn: null,
        message: "No feed data available",
      });
    }

    // Group feeds by day
    const feedsByDay = allFeeds.reduce<Record<string, typeof allFeeds>>(
      (acc, feed) => {
        const dayKey = format(new Date(feed.feedTime), "yyyy-MM-dd");
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(feed);
        return acc;
      },
      {}
    );

    // Sort feeds within each day
    Object.values(feedsByDay).forEach((feeds) => {
      feeds.sort(
        (a, b) =>
          new Date(a.feedTime).getTime() - new Date(b.feedTime).getTime()
      );
    });

    // Determine which feed number we're predicting
    const currentFeedNumber = todayFeeds.length + 1;

    // Get the same numbered feed from previous days
    const nthFeeds = Object.values(feedsByDay)
      .filter((feeds) => feeds.length >= currentFeedNumber - 1)
      .map((feeds) => feeds[currentFeedNumber - 1])
      .filter((feed) => feed !== undefined);

    if (nthFeeds.length === 0) {
      return NextResponse.json({
        nextFeedIn: null,
        message: `No historical data available for feed #${currentFeedNumber}`,
      });
    }

    // Calculate average time of nth feeds
    let totalMinutesSinceMidnight = 0;
    nthFeeds.forEach((feed) => {
      const feedDate = new Date(feed.feedTime);
      const startOfFeedDay = startOfDay(feedDate);
      const minutesSinceMidnight =
        (feedDate.getTime() - startOfFeedDay.getTime()) / (1000 * 60);
      totalMinutesSinceMidnight += minutesSinceMidnight;
    });

    const averageMinutesSinceMidnight = Math.round(
      totalMinutesSinceMidnight / nthFeeds.length
    );

    // Calculate next feed time based on today's start and average nth feed time
    const nextFeedTime = new Date(
      todayStart.getTime() + averageMinutesSinceMidnight * 60 * 1000
    );

    // If we're past today's predicted time, calculate for tomorrow
    if (nextFeedTime < now) {
      nextFeedTime.setDate(nextFeedTime.getDate() + 1);
    }

    // Calculate time until next feed
    const timeUntilNextFeed = nextFeedTime.getTime() - now.getTime();
    const hoursUntilNextFeed = Math.floor(timeUntilNextFeed / (1000 * 60 * 60));
    const minutesUntilNextFeed = Math.floor(
      (timeUntilNextFeed % (1000 * 60 * 60)) / (1000 * 60)
    );

    // Get the recent prediction history
    const recentPredictions = Object.entries(feedsByDay)
      .sort(
        ([dateA], [dateB]) =>
          new Date(dateB).getTime() - new Date(dateA).getTime()
      )
      .slice(0, 5)
      .map(([date, feeds]) => {
        const nthFeed = feeds[currentFeedNumber - 1];
        if (!nthFeed) return null;

        return {
          actualTime: format(new Date(nthFeed.feedTime), "HH:mm"),
          predictedTime: format(
            new Date(
              startOfDay(new Date(nthFeed.feedTime)).getTime() +
                averageMinutesSinceMidnight * 60 * 1000
            ),
            "HH:mm"
          ),
          date: format(new Date(date), "MMM d, yyyy"),
          feedNumber: currentFeedNumber,
        };
      })
      .filter((prediction) => prediction !== null);

    return NextResponse.json({
      nextFeedIn: {
        hours: hoursUntilNextFeed,
        minutes: minutesUntilNextFeed,
      },
      message: `Feed #${currentFeedNumber} is predicted in ${hoursUntilNextFeed} hours and ${minutesUntilNextFeed} minutes`,
      predictionHistory: recentPredictions,
      averageFeedTime: format(
        new Date(
          todayStart.getTime() + averageMinutesSinceMidnight * 60 * 1000
        ),
        "HH:mm"
      ),
      feedNumber: currentFeedNumber,
    });
  } catch (error) {
    console.error("Error calculating next feed time:", error);
    return NextResponse.json(
      { error: "Failed to calculate next feed time" },
      { status: 500 }
    );
  }
}
