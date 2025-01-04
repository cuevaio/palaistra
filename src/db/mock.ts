import { faker } from '@faker-js/faker';
import { and, count, eq, sum } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/db';
import {
  category,
  group,
  membership,
  palaistra,
  sport,
  user,
} from '@/db/schema';

import { days, roles } from '@/lib/constants';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // Create users
  const userIds = await seedUsers(50);
  console.log(`✅ Created ${userIds.length} users`);

  // Create palaistras
  const palaistraIds = await seedPalaistras(5);
  console.log(`✅ Created ${palaistraIds.length} palaistras`);

  // Create memberships
  await seedMemberships(userIds, palaistraIds);
  console.log('✅ Created memberships');

  // For each palaistra, create sports, categories, and groups
  for (const palaistraId of palaistraIds) {
    const sportIds = await seedSports(palaistraId, 3);
    console.log(
      `✅ Created ${sportIds.length} sports for palaistra ${palaistraId}`,
    );

    for (const sportId of sportIds) {
      const categoryIds = await seedCategories(palaistraId, sportId, 4);
      console.log(
        `✅ Created ${categoryIds.length} categories for sport ${sportId}`,
      );

      for (const categoryId of categoryIds) {
        await seedGroups(palaistraId, sportId, categoryId, 3);
        console.log(`✅ Created groups for category ${categoryId}`);
      }
    }
  }

  console.log('✨ Database seeding completed');
}

async function seedUsers(count: number) {
  const users = Array.from({ length: count }, () => ({
    id: nanoid(12),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
  }));

  await db.insert(user).values(users);
  return users.map((u) => u.id);
}

async function seedPalaistras(count: number) {
  const palaistras = Array.from({ length: count }, () => ({
    id: nanoid(12),
    handle: faker.internet.userName().toLowerCase(),
    name: faker.company.name(),
    pic_url: faker.image.url(),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));

  await db.insert(palaistra).values(palaistras);
  return palaistras.map((p) => p.id);
}

async function seedMemberships(userIds: string[], palaistraIds: string[]) {
  const memberships = [];

  for (const userId of userIds) {
    // Assign each user to 1-3 random palaistras
    const numPalaistras = faker.number.int({ min: 1, max: 3 });
    const assignedPalaistras = faker.helpers.arrayElements(
      palaistraIds,
      numPalaistras,
    );

    for (const palaistraId of assignedPalaistras) {
      memberships.push({
        user_id: userId,
        palaistra_id: palaistraId,
        roles: faker.helpers.arrayElements(
          roles,
          faker.number.int({ min: 1, max: 3 }),
        ),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      });
    }
  }

  await db.insert(membership).values(memberships);
}

async function seedSports(palaistraId: string, count: number) {
  const sports = Array.from({ length: count }, () => ({
    id: nanoid(12),
    palaistra_id: palaistraId,
    name: faker.helpers.arrayElement([
      'Judo',
      'Karate',
      'Boxing',
      'Wrestling',
      'BJJ',
      'Muay Thai',
    ]),
    description: faker.lorem.paragraph(),
    category_count: 0,
    group_count: 0,
    student_count: 0,
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));

  await db.insert(sport).values(sports);
  return sports.map((s) => s.id);
}

async function seedCategories(
  palaistraId: string,
  sportId: string,
  count: number,
) {
  const categories = Array.from({ length: count }, () => ({
    id: nanoid(12),
    palaistra_id: palaistraId,
    sport_id: sportId,
    name: faker.helpers.arrayElement([
      'Beginner',
      'Intermediate',
      'Advanced',
      'Kids',
      'Teens',
      'Adults',
    ]),
    description: faker.lorem.paragraph(),
    group_count: 0,
    student_count: 0,
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }));

  await db.insert(category).values(categories);
  return categories.map((c) => c.id);
}

async function seedGroups(
  palaistraId: string,
  sportId: string,
  categoryId: string,
  count: number,
) {
  const groups = Array.from({ length: count }, () => {
    const maxStudents = faker.number.int({ min: 10, max: 30 });
    const studentCount = faker.number.int({ min: 0, max: maxStudents });

    return {
      id: nanoid(12),
      palaistra_id: palaistraId,
      sport_id: sportId,
      category_id: categoryId,
      name:
        faker.helpers.arrayElement([
          'Morning',
          'Afternoon',
          'Evening',
          'Weekend',
        ]) + ' Class',
      max_students: maxStudents,
      student_count: studentCount,
      days: faker.helpers.arrayElements(
        days,
        faker.number.int({ min: 1, max: 5 }),
      ),
      start_time: faker.date.soon().toTimeString().split(' ')[0],
      end_time: faker.date.soon().toTimeString().split(' ')[0],
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    };
  });

  await db.insert(group).values(groups);

  // Update counts
  await updateCounts(palaistraId, sportId, categoryId);
}

async function updateCounts(
  palaistraId: string,
  sportId: string,
  categoryId: string,
) {
  // Update category counts
  const categoryGroupCount = await db
    .select({ count: count() })
    .from(group)
    .where(
      and(
        eq(group.category_id, categoryId),
        eq(group.palaistra_id, palaistraId),
      ),
    );

  const categoryStudentCount = await db
    .select({ sum: sum(group.student_count) })
    .from(group)
    .where(
      and(
        eq(group.category_id, categoryId),
        eq(group.palaistra_id, palaistraId),
      ),
    );

  await db
    .update(category)
    .set({
      group_count: Number(categoryGroupCount[0].count),
      student_count: Number(categoryStudentCount[0].sum) || 0,
    })
    .where(eq(category.id, categoryId));

  // Update sport counts
  const sportGroupCount = await db
    .select({ count: count() })
    .from(group)
    .where(
      and(eq(group.sport_id, sportId), eq(group.palaistra_id, palaistraId)),
    );

  const sportStudentCount = await db
    .select({ sum: sum(group.student_count) })
    .from(group)
    .where(
      and(eq(group.sport_id, sportId), eq(group.palaistra_id, palaistraId)),
    );

  await db
    .update(sport)
    .set({
      group_count: Number(sportGroupCount[0].count),
      student_count: Number(sportStudentCount[0].sum) || 0,
    })
    .where(eq(sport.id, sportId));
}

// Run the seeder
seedDatabase().catch(console.error);
