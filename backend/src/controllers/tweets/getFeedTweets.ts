import { Response } from "express";
import db from "../../config/db.config";
import { AuthRequest, FeedTweet } from "../../types";

export const getFeedTweets = async (req: AuthRequest, res: Response) => {
  try {
    const loggedInUserId = req.user?.user_id;

    const [rows] = await db.query<FeedTweet[]>(
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
          FROM reactions r1 
          WHERE r1.tweet_id = t.tweet_id
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
          SELECT 1 FROM reactions r 
          WHERE r.tweet_id = t.tweet_id AND r.user_id = ?
        ) AS isLiked,

        (
          SELECT COUNT(*)
          FROM comments c
          WHERE c.tweet_id = t.tweet_id AND c.parent_comment_id IS NULL
        ) AS comment_count,

        t.user_id,
        'tweet' AS type

      FROM tweets t
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN tweets_media m ON t.tweet_id = m.tweet_id
      WHERE t.user_id IN (
        SELECT followee_id FROM follow WHERE follower_id = ?
      ) OR t.user_id = ?

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
          SELECT 1 FROM reactions r2 
          WHERE r2.tweet_id = t.tweet_id AND r2.user_id = ?
        ) AS isLiked,

        (
          SELECT COUNT(*)
          FROM comments c
          WHERE c.tweet_id = t.tweet_id AND c.parent_comment_id IS NULL
        ) AS comment_count,

        t.user_id,
        'retweet' AS type

      FROM retweets r
      JOIN tweets t ON r.tweet_id = t.tweet_id
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN tweets_media m ON t.tweet_id = m.tweet_id
      WHERE r.user_id IN (
        SELECT followee_id FROM follow WHERE follower_id = ?
      ) OR t.user_id = ?

      ORDER BY created_at DESC`,
      [
        loggedInUserId,
        loggedInUserId,
        loggedInUserId,
        loggedInUserId,
        loggedInUserId,
        loggedInUserId,
        loggedInUserId,
        loggedInUserId
      ],
    );

    // Fix timezone: Convert MySQL DATETIME to ISO UTC string
    const result = rows.map(row => ({
      ...row,
      created_at: new Date(row.created_at).toISOString()
    }));

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
