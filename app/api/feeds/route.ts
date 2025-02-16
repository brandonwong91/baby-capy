import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FeedRequest {
  feedTime: string;
  amount: number;
  wetDiaper: boolean;
  pooped: boolean;
  solidFoods?: string[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const timezoneOffset = parseInt(searchParams.get("timezoneOffset") || "0");

  try {
    // Create date in UTC
    const currentDate = date ? new Date(date) : new Date();

    // Calculate start of day in local time by applying timezone offset
    const startDate = new Date(currentDate);
    const offsetHours = Math.floor(timezoneOffset / 60);
    const offsetMinutes = timezoneOffset % 60;
    startDate.setUTCHours(offsetHours, offsetMinutes, 0, 0);

    // Calculate end of day in local time by applying timezone offset
    const endDate = new Date(currentDate);
    endDate.setUTCHours(23 + offsetHours, 59 + offsetMinutes, 59, 999);
    const feeds = await prisma.feed.findMany({
      where: {
        feedTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        feedTime: "asc",
      },
    });
    return NextResponse.json(feeds);
  } catch (error: unknown) {
    console.error("Error fetching feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FeedRequest;

    // Validate required fields
    if (
      !body.feedTime ||
      typeof body.amount !== "number" ||
      typeof body.wetDiaper !== "boolean" ||
      typeof body.pooped !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const feed = await prisma.feed.create({
      data: {
        feedTime: new Date(body.feedTime),
        amount: body.amount,
        wetDiaper: body.wetDiaper,
        pooped: body.pooped,
        solidFoods: (body.solidFoods || []).map((food) => food.toLowerCase()),
      },
    });

    return NextResponse.json(feed);
  } catch (error: unknown) {
    console.error("Error creating feed:", error);
    return NextResponse.json(
      { error: "Failed to create feed entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Feed ID is required" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as FeedRequest;

    // Validate required fields
    if (
      !body.feedTime ||
      typeof body.amount !== "number" ||
      typeof body.wetDiaper !== "boolean" ||
      typeof body.pooped !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const feed = await prisma.feed.update({
      where: { id },
      data: {
        feedTime: new Date(body.feedTime),
        amount: body.amount,
        wetDiaper: body.wetDiaper,
        pooped: body.pooped,
        solidFoods: (body.solidFoods || []).map((food) => food.toLowerCase()),
      },
    });

    return NextResponse.json(feed);
  } catch (error: unknown) {
    console.error("Error updating feed:", error);
    return NextResponse.json(
      { error: "Failed to update feed entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Feed ID is required" }, { status: 400 });
  }

  try {
    await prisma.feed.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting feed:", error);
    return NextResponse.json(
      { error: "Failed to delete feed entry" },
      { status: 500 }
    );
  }
}
