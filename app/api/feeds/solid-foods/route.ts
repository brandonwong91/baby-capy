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

export async function PUT(request: Request) {
  try {
    const { oldFood, newFood } = await request.json();
    console.log("old", oldFood, "new", newFood);
    if (!oldFood || !newFood) {
      return NextResponse.json(
        { error: "Both old and new food names are required" },
        { status: 400 }
      );
    }

    // Get all feeds that contain the old food name
    const feeds = await prisma.feed.findMany({
      where: {
        solidFoods: {
          has: oldFood.toLowerCase(),
        },
      },
    });

    // Update each feed's solidFoods array
    const updatePromises = feeds.map((feed) => {
      const updatedSolidFoods = feed.solidFoods.map((food) =>
        food.toLowerCase() === oldFood.toLowerCase()
          ? newFood.toLowerCase()
          : food
      );

      return prisma.feed.update({
        where: { id: feed.id },
        data: {
          solidFoods: updatedSolidFoods,
        },
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Successfully updated '${oldFood}' to '${newFood}'`,
    });
  } catch (error) {
    console.error("Error updating solid food:", error);
    return NextResponse.json(
      { error: "Failed to update solid food" },
      { status: 500 }
    );
  }
}
