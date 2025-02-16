import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all feeds that have solid foods
    const feeds = await prisma.feed.findMany({
      where: {
        solidFoods: {
          isEmpty: false,
        },
      },
      orderBy: {
        feedTime: "desc",
      },
      select: {
        feedTime: true,
        solidFoods: true,
      },
    });

    // Transform and group the data by food name, keeping the latest timestamp
    const foodMap = new Map();

    feeds.forEach((feed) => {
      feed.solidFoods.forEach((food) => {
        const existingEntry = foodMap.get(food);
        const currentTimestamp = feed.feedTime.toISOString();

        if (
          !existingEntry ||
          new Date(currentTimestamp) > new Date(existingEntry.timestamp)
        ) {
          foodMap.set(food, {
            food: food,
            timestamp: currentTimestamp,
          });
        }
      });
    });

    // Convert Map to array and sort by timestamp in descending order
    const solidFoodsWithTimestamps = Array.from(foodMap.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return NextResponse.json({
      solidFoods: solidFoodsWithTimestamps,
    });
  } catch (error) {
    console.error("Error fetching solid foods:", error);
    return NextResponse.json(
      { error: "Failed to fetch solid foods" },
      { status: 500 }
    );
  }
}
