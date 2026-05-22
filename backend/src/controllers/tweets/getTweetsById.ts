import { Response } from "express";
import db from "../../config/db.config";
import { AuthRequest, TweetById } from "../../types";

export const getTweetById = async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = req.params.id;
    const loggedInUserId = req.user?.user_id;

    const [result] = await db.query<TweetById[]>(
      `SELECT 
        t.tweet_id,
        t.content,
        t.created_at,
        t.user_id,
        u.username,
        u.display_name,
        u.profile_image,
        m.media_url,
        m.media_type,

        (
          SELECT COUNT(*) 
          FROM reactions r 
          WHERE r.tweet_id = t.tweet_id
        ) AS like_count,
         (
          SELECT COUNT(*) 
          FROM retweets rt2 
          WHERE rt2.tweet_id = t.tweet_id
        ) AS retweet_count,
         EXISTS (
  SELECT 1
  FROM retweets rt
  WHERE rt.tweet_id = t.tweet_id 
    AND rt.user_id = ?
) AS isRetweeted,

        EXISTS (
          SELECT 1 
          FROM reactions r2 
          WHERE r2.tweet_id = t.tweet_id AND r2.user_id = ?
        ) AS isLiked,

        (
          SELECT COUNT(*)
          FROM comments c
          WHERE c.tweet_id = t.tweet_id AND c.parent_comment_id IS NULL
        ) AS comment_count

      FROM tweets t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN tweets_media m ON t.tweet_id = m.tweet_id
      WHERE t.tweet_id = ?`,
      [loggedInUserId, loggedInUserId, tweetId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    // Normalize created_at to ISO UTC string (consistent with feed)
    const normalized = result.map(row => ({
      ...row,
      created_at: new Date(row.created_at).toISOString()
    }));

    res.status(200).json(normalized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};