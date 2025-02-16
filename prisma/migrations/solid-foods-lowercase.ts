import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateSolidFoodsToLowercase() {
  try {
    // Fetch all feeds that have solid foods
    const feeds = await prisma.feed.findMany({
      where: {
        solidFoods: {
          isEmpty: false,
        },
      },
    });

    console.log(`Found ${feeds.length} feeds with solid foods to process`);

    // Process each feed and update solid foods to lowercase
    for (const feed of feeds) {
      const lowerCaseSolidFoods = feed.solidFoods.map((food: string) =>
        food.toLowerCase()
      );

      // Update only if there are changes
      if (
        JSON.stringify(lowerCaseSolidFoods) !== JSON.stringify(feed.solidFoods)
      ) {
        await prisma.feed.update({
          where: { id: feed.id },
          data: { solidFoods: lowerCaseSolidFoods },
        });
        console.log(`Updated feed ${feed.id} solid foods to lowercase`);
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateSolidFoodsToLowercase()
  .then(() => console.log("Migration script finished"))
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
