import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../config/db.config";

type SeedUser = {
  display_name: string;
  username: string;
  email: string;
  dob: string;
  country: string;
  bio: string;
};

const password = "Dev123";

const users: SeedUser[] = [
  {
    display_name: "Aarav Mehta",
    username: "aarav",
    email: "aarav@test.com",
    dob: "1998-04-12",
    country: "IN",
    bio: "Frontend engineer. Building tiny useful things.",
  },
  {
    display_name: "Maya Shah",
    username: "maya",
    email: "maya@test.com",
    dob: "1999-09-21",
    country: "IN",
    bio: "Product designer, chai loyalist, weekend photographer.",
  },
  {
    display_name: "Rohan Verma",
    username: "rohan",
    email: "rohan@test.com",
    dob: "1996-01-08",
    country: "IN",
    bio: "Backend dev. Databases, APIs, and clean logs.",
  },
  {
    display_name: "Sara Khan",
    username: "sara",
    email: "sara@test.com",
    dob: "2000-07-17",
    country: "IN",
    bio: "Writing about startups, design, and everyday tech.",
  },
  {
    display_name: "Kabir Rao",
    username: "kabir",
    email: "kabir@test.com",
    dob: "1997-11-03",
    country: "IN",
    bio: "Indie hacker. Shipping before overthinking.",
  },
  {
    display_name: "Nisha Iyer",
    username: "nisha",
    email: "nisha@test.com",
    dob: "1995-06-26",
    country: "IN",
    bio: "QA engineer. I break things so users do not have to.",
  },
  {
    display_name: "Dev Patel",
    username: "dev",
    email: "dev@test.com",
    dob: "1998-12-30",
    country: "IN",
    bio: "Full-stack learner building an X clone.",
  },
];

const postsByUsername: Record<string, string[]> = {
  aarav: [
    "Rebuilt a timeline component today. Tiny details like empty states make the whole app feel calmer.",
    "Reminder to future me: good API responses are part of the user interface too.",
  ],
  maya: [
    "Dark mode is not just black backgrounds. Contrast and spacing matter a lot.",
    "Sketching profile page states: own profile, other user's profile, loading, and empty tabs.",
  ],
  rohan: [
    "A small transaction around tweet creation saves a lot of cleanup later.",
    "Indexes are quiet until they are missing. Then everyone hears about them.",
  ],
  sara: [
    "The best social feeds make posting feel low effort and reading feel focused.",
    "Writing UX copy for error states is harder than writing happy-path copy.",
  ],
  kabir: [
    "Today's goal: make one feature work end to end, then make it pleasant.",
    "Side projects move faster when the seed data actually looks human.",
  ],
  nisha: [
    "Testing like, retweet, comment, reply, delete, follow, unfollow. The classics.",
    "A bug that reproduces with seed data is already halfway solved.",
  ],
  dev: [
    "React frontend is getting real now. Components, pages, context, the whole little city.",
    "No images in seed posts for now. Plain text is enough to test the core flow.",
  ],
};

const followPairs: Array<[string, string]> = [
  ["dev", "aarav"],
  ["dev", "maya"],
  ["dev", "rohan"],
  ["aarav", "maya"],
  ["aarav", "kabir"],
  ["maya", "sara"],
  ["maya", "nisha"],
  ["rohan", "aarav"],
  ["rohan", "nisha"],
  ["sara", "maya"],
  ["sara", "kabir"],
  ["kabir", "dev"],
  ["kabir", "rohan"],
  ["nisha", "dev"],
  ["nisha", "sara"],
];

const runSeed = async () => {
  const conn = await db.getConnection();
  const usernames = users.map((user) => user.username);

  try {
    await conn.beginTransaction();

    const [existingUsers] = await conn.query<Array<RowDataPacket & { user_id: number }>>(
      `SELECT user_id FROM users WHERE username IN (?)`,
      [usernames],
    );

    const existingUserIds = existingUsers.map((user) => user.user_id);

    if (existingUserIds.length > 0) {
      await conn.query(`DELETE FROM notifications WHERE user_id IN (?) OR actor_id IN (?)`, [existingUserIds, existingUserIds]);
      await conn.query(
        `DELETE FROM comment_reactions
         WHERE user_id IN (?)
            OR comment_id IN (
              SELECT comment_id FROM comments
              WHERE user_id IN (?) OR tweet_id IN (SELECT tweet_id FROM tweets WHERE user_id IN (?))
            )`,
        [existingUserIds, existingUserIds, existingUserIds],
      );
      await conn.query(
        `DELETE FROM comments
         WHERE user_id IN (?) OR tweet_id IN (SELECT tweet_id FROM tweets WHERE user_id IN (?))`,
        [existingUserIds, existingUserIds],
      );
      await conn.query(
        `DELETE FROM reactions
         WHERE user_id IN (?) OR tweet_id IN (SELECT tweet_id FROM tweets WHERE user_id IN (?))`,
        [existingUserIds, existingUserIds],
      );
      await conn.query(
        `DELETE FROM retweets
         WHERE user_id IN (?) OR tweet_id IN (SELECT tweet_id FROM tweets WHERE user_id IN (?))`,
        [existingUserIds, existingUserIds],
      );
      await conn.query(
        `DELETE FROM tweets_media
         WHERE tweet_id IN (SELECT tweet_id FROM tweets WHERE user_id IN (?))`,
        [existingUserIds],
      );
      await conn.query(`DELETE FROM tweets WHERE user_id IN (?)`, [existingUserIds]);
      await conn.query(`DELETE FROM follow WHERE follower_id IN (?) OR followee_id IN (?)`, [existingUserIds, existingUserIds]);
      await conn.query(`DELETE FROM users WHERE user_id IN (?)`, [existingUserIds]);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userIds = new Map<string, number>();

    for (const user of users) {
      const [result] = await conn.query<ResultSetHeader>(
        `INSERT INTO users
          (display_name, username, email, password, dob, country, bio, profile_image, cover_photo)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
        [user.display_name, user.username, user.email, hashedPassword, user.dob, user.country, user.bio],
      );

      userIds.set(user.username, result.insertId);
    }

    for (const [follower, followee] of followPairs) {
      await conn.query(
        `INSERT INTO follow (follower_id, followee_id) VALUES (?, ?)`,
        [userIds.get(follower), userIds.get(followee)],
      );
    }

    const tweetIds = new Map<string, number[]>();

    for (const [username, posts] of Object.entries(postsByUsername)) {
      const authorId = userIds.get(username);
      if (!authorId) continue;

      tweetIds.set(username, []);

      for (const content of posts) {
        const [result] = await conn.query<ResultSetHeader>(
          `INSERT INTO tweets (user_id, content) VALUES (?, ?)`,
          [authorId, content],
        );

        tweetIds.get(username)?.push(result.insertId);
      }
    }

    const tweet = (username: string, index = 0) => tweetIds.get(username)?.[index];

    const reactionPairs: Array<[string, number | undefined]> = [
      ["dev", tweet("maya")],
      ["dev", tweet("aarav", 1)],
      ["aarav", tweet("dev")],
      ["maya", tweet("sara")],
      ["rohan", tweet("nisha")],
      ["sara", tweet("kabir")],
      ["kabir", tweet("rohan")],
      ["nisha", tweet("dev", 1)],
      ["nisha", tweet("maya", 1)],
    ];

    for (const [username, tweetId] of reactionPairs) {
      if (!tweetId) continue;
      await conn.query(`INSERT INTO reactions (user_id, tweet_id) VALUES (?, ?)`, [userIds.get(username), tweetId]);
    }

    const retweetPairs: Array<[string, number | undefined]> = [
      ["dev", tweet("sara")],
      ["aarav", tweet("rohan")],
      ["maya", tweet("dev")],
      ["kabir", tweet("nisha")],
      ["nisha", tweet("aarav")],
    ];

    for (const [username, tweetId] of retweetPairs) {
      if (!tweetId) continue;
      await conn.query(`INSERT INTO retweets (user_id, tweet_id) VALUES (?, ?)`, [userIds.get(username), tweetId]);
    }

    const comments: Array<{ author: string; tweetId?: number; content: string; replies: Array<{ author: string; content: string }> }> = [
      {
        author: "maya",
        tweetId: tweet("aarav"),
        content: "That empty state point is so true. It changes the whole mood.",
        replies: [
          { author: "aarav", content: "Exactly. Empty should still feel intentional." },
          { author: "nisha", content: "And it makes testing easier too." },
        ],
      },
      {
        author: "dev",
        tweetId: tweet("rohan"),
        content: "Transactions saved me twice this week already.",
        replies: [
          { author: "rohan", content: "They are boring in the best possible way." },
        ],
      },
      {
        author: "sara",
        tweetId: tweet("maya", 1),
        content: "Spacing is doing more work than people give it credit for.",
        replies: [
          { author: "maya", content: "100%. The quiet parts are the design." },
          { author: "kabir", content: "Stealing that line for my notes." },
        ],
      },
      {
        author: "kabir",
        tweetId: tweet("dev", 1),
        content: "Plain text seed posts are perfect for checking core flows first.",
        replies: [
          { author: "dev", content: "Images can come after the timeline behaves." },
        ],
      },
      {
        author: "nisha",
        tweetId: tweet("sara"),
        content: "Low effort posting is a great product benchmark.",
        replies: [
          { author: "sara", content: "Yes, the composer should almost disappear." },
        ],
      },
    ];

    for (const comment of comments) {
      if (!comment.tweetId) continue;

      const [commentResult] = await conn.query<ResultSetHeader>(
        `INSERT INTO comments (user_id, tweet_id, content, parent_comment_id)
         VALUES (?, ?, ?, NULL)`,
        [userIds.get(comment.author), comment.tweetId, comment.content],
      );

      for (const reply of comment.replies) {
        await conn.query(
          `INSERT INTO comments (user_id, tweet_id, content, parent_comment_id)
           VALUES (?, ?, ?, ?)`,
          [userIds.get(reply.author), comment.tweetId, reply.content, commentResult.insertId],
        );
      }
    }

    await conn.commit();

    console.log("Seed completed successfully.");
    console.log(`Created ${users.length} users, 14 tweets, follows, comments, replies, likes, and retweets.`);
    console.log(`Test password for every seeded user: ${password}`);
  } catch (err) {
    await conn.rollback();
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    conn.release();
    await db.end();
  }
};

runSeed();
