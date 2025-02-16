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

    // Transform the data to match the expected structure
    const solidFoodsWithTimestamps = feeds.flatMap((feed) =>
      feed.solidFoods.map((food) => ({
        food: food,
        timestamp: feed.feedTime.toISOString(),
      }))
    );
    // Sort by timestamp in descending order
    solidFoodsWithTimestamps.sort(
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
