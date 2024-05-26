import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { integer, pgTable, serial, varchar } from 'drizzle-orm/pg-core';
import { eq, ilike } from 'drizzle-orm';

export const db = drizzle(
  neon(process.env.POSTGRES_URL!, {
    fetchOptions: {
      cache: 'no-store'
    }
  })
);

const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }),
  username: varchar('username', { length: 50 }),
  imageUrl: varchar('imageurl', { length: 255 })
});

const treasure = pgTable('treasure', {
  id: serial('id').primaryKey(),
  rank: integer('rank'),
  winner: varchar('winner', { length: 50 })
});

export type SelectUser = typeof users.$inferSelect & { rank: number | null };

export async function getUsers(
  search: string,
  offset: number
): Promise<{
  users: SelectUser[];
  newOffset: number | null;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      users: await db
        .select({
          id: users.id,
          imageUrl: users.imageUrl,
          name: users.name,
          username: users.username,
          rank: treasure.rank
        })
        .from(users)
        .leftJoin(treasure, eq(users.name, treasure.winner))
        .where(ilike(users.name, `%${search}%`))
        .limit(1000),
      newOffset: null
    };
  }

  if (offset === null) {
    return { users: [], newOffset: null };
  }

  const moreUsers = await db
    .select({
      id: users.id,
      imageUrl: users.imageUrl,
      name: users.name,
      username: users.username,
      rank: treasure.rank
    })
    .from(users)
    .leftJoin(treasure, eq(users.name, treasure.winner))
    .limit(20)
    .offset(offset);
  const newOffset = moreUsers.length >= 20 ? offset + 20 : null;
  return { users: moreUsers, newOffset };
}

export async function deleteUserById(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

export async function createUser(
  name: string,
  username: string,
  imageUrl: string
) {
  const result = await db.select().from(users).where(eq(users.name, name));
  if (result.length > 0) {
    return;
  }
  await db.insert(users).values({ name, username, imageUrl: imageUrl });
}

export async function updateTreasureByRank(
  rank: number,
  winner: string
): Promise<void> {
  const rankInfo = await db
    .select()
    .from(treasure)
    .where(eq(treasure.rank, rank));
  if (rankInfo.length === 0) {
    throw new Error('랭크가 없습니다.');
  }
  const winnerInfo = await db
    .select()
    .from(users)
    .where(eq(users.name, winner));
  if (winnerInfo.length !== 0) {
    throw new Error('이미 수령하셨습니다.');
  }
  if (!rankInfo[0].winner) {
    await db.update(treasure).set({ winner }).where(eq(treasure.rank, rank));
  } else {
    throw new Error('이미 당첨된 랭크입니다.');
  }
}
