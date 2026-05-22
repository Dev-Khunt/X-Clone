import { Response } from "express";
import { AuthRequest } from "../../types";
import { debug } from "util";
import db from "../../config/db.config";

export const retweetTweet = async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = Number(req.params.tweetId);
    const userId = req.user?.user_id;

    // Check if tweet exists
    const [tweetRows] = await db.query<any[]>(
      `SELECT user_id FROM tweets WHERE tweet_id = ?`,
      [tweetId],
    );

    if (tweetRows.length === 0) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    const tweetOwnerId = tweetRows[0].user_id;

    // Check if already retweeted
    const [existing] = await db.query<any[]>(
      `SELECT 1 FROM retweets WHERE user_id = ? AND tweet_id = ?`,
      [userId, tweetId],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Already retweeted",
      });
    }

    // Insert retweet
    await db.query(`INSERT INTO retweets (user_id, tweet_id) VALUES (?, ?)`, [
      userId,
      tweetId,
    ]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
