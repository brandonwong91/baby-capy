import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { differenceInDays, differenceInHours } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const lastPoopFeed = await prisma.feed.findFirst({
      where: {
        pooped: true,
      },
      orderBy: {
        feedTime: "desc",
      },
    });

    if (!lastPoopFeed) {
      return NextResponse.json({
        days: 0,
        hours: 0,
        message: "No poop records found",
      });
    }

    const now = new Date();
    const lastPoopTime = new Date(lastPoopFeed.feedTime);

    const days = differenceInDays(now, lastPoopTime);
    const totalHours = differenceInHours(now, lastPoopTime);
    const remainingHours = totalHours % 24;

    return NextResponse.json({
      days,
      hours: remainingHours,
      message: `Last pooped ${days} days and ${remainingHours} hours ago`,
      feedTime: lastPoopFeed.feedTime.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching last poop time:", error);
    return NextResponse.json(
      { error: "Failed to fetch last poop time" },
      { status: 500 }
    );
  }
}
