import { prisma } from '@/lib/prisma';
import { allAchievements } from './definitions';

/**
 * Seed the database with all achievement definitions
 * This ensures all achievements exist in the Achievement table
 */
export async function seedAchievements() {
  console.log('Seeding achievements...');

  let created = 0;
  let updated = 0;

  for (const achievement of allAchievements) {
    const existing = await prisma.achievement.findUnique({
      where: { code: achievement.code },
    });

    if (existing) {
      // Update existing achievement
      await prisma.achievement.update({
        where: { code: achievement.code },
        data: {
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          tier: achievement.tier,
          requirement: achievement.requirement as any,
          sortOrder: achievement.sortOrder,
        },
      });
      updated++;
    } else {
      // Create new achievement
      await prisma.achievement.create({
        data: {
          id: achievement.id,
          code: achievement.code,
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          tier: achievement.tier,
          requirement: achievement.requirement as any,
          sortOrder: achievement.sortOrder,
        },
      });
      created++;
    }
  }

  console.log(`Seeding complete! Created: ${created}, Updated: ${updated}`);
  return { created, updated };
}

/**
 * CLI script to run seeding
 * Usage: npx ts-node src/lib/achievements/seed.ts
 */
if (require.main === module) {
  seedAchievements()
    .then(() => {
      console.log('Success!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding achievements:', error);
      process.exit(1);
    });
}
