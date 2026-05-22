import { Response } from "express";
import { AuthRequest, UserTweet } from "../../types";
import db from "../../config/db.config";

export const getUserTweets = async (req: AuthRequest, res: Response) => {
  try {
    const username = req.params.username;
    const loggedInUserId = req.user?.user_id;

    // Get user_id from username
    const [userRows] = await db.query<any[]>(
      `SELECT user_id FROM users WHERE username = ?`,
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userRows[0].user_id;

    // Main query
    const [result] = await db.query<UserTweet[]>(
      `SELECT 
        t.tweet_id,
        t.content,
        t.created_at,
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
          FROM retweets rt 
          WHERE rt.tweet_id = t.tweet_id
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
        'tweet' AS type
      FROM tweets t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN tweets_media m ON t.tweet_id = m.tweet_id
      WHERE t.user_id = ?

      UNION ALL

      SELECT 
        t.tweet_id,
        t.content,
        r.created_at,
        u.username,
        u.display_name,
        u.profile_image,
        m.media_url,
        m.media_type,
        (
          SELECT COUNT(*) 
          FROM reactions r3 
          WHERE r3.tweet_id = t.tweet_id
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
          FROM reactions r4 
          WHERE r4.tweet_id = t.tweet_id AND r4.user_id = ?
        ) AS isLiked,
        'retweet' AS type
      FROM retweets r
      JOIN tweets t ON r.tweet_id = t.tweet_id
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN tweets_media m ON t.tweet_id = m.tweet_id
      WHERE r.user_id = ?

      ORDER BY created_at DESC`,
      [loggedInUserId, loggedInUserId, userId, loggedInUserId, loggedInUserId, userId]
    );

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};