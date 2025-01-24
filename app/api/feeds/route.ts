import { NextResponse } from "next/server";
import { PrismaClient, Feed } from "@prisma/client";

type ApiError = {
  error: string;
};

type ApiSuccess = {
  success: boolean;
};

type FeedRequest = {
  feedTime: string;
  amount: number;
  wetDiaper: boolean;
  pooped: boolean;
};

const prisma = new PrismaClient();

export async function GET(
  request: Request
): Promise<NextResponse<Feed[] | ApiError>> {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  try {
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const feeds = await prisma.feed.findMany({
      where: {
        feedTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        feedTime: "desc",
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

export async function POST(
  request: Request
): Promise<NextResponse<Feed | ApiError>> {
  try {
    const body = (await request.json()) as FeedRequest;
    const feed = await prisma.feed.create({
      data: {
        feedTime: new Date(body.feedTime),
        amount: body.amount,
        wetDiaper: body.wetDiaper,
        pooped: body.pooped,
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

export async function PUT(
  request: Request
): Promise<NextResponse<Feed | ApiError>> {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Feed ID is required" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as FeedRequest;
    const feed = await prisma.feed.update({
      where: { id },
      data: {
        feedTime: new Date(body.feedTime),
        amount: body.amount,
        wetDiaper: body.wetDiaper,
        pooped: body.pooped,
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

export async function DELETE(
  request: Request
): Promise<NextResponse<ApiSuccess | ApiError>> {
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
