import { Response } from "express";
import { AuthRequest, UserLike } from "../../types";
import db from "../../config/db.config";

    export const getUserLikes = async (req: AuthRequest, res: Response) => {
  try {
    const username = req.params.username;
    const loggedInUserId = req.user?.user_id;

    // Get user_id
    const [userRows] = await db.query<any[]>(
      `SELECT user_id FROM users WHERE username = ?`,
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = userRows[0].user_id;

    // Fetch liked tweets
    const [result] = await db.query<UserLike[]>(
      `SELECT 
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
          FROM reactions r1 
          WHERE r1.tweet_id = t.tweet_id
        ) AS like_count,

        (
          SELECT COUNT(*) 
          FROM retweets rt 
          WHERE rt.tweet_id = t.tweet_id
        ) AS retweet_count,

        EXISTS (
          SELECT 1 
          FROM reactions r2 
          WHERE r2.tweet_id = t.tweet_id AND r2.user_id = ?
        ) AS isLiked,

        'like' AS type

      FROM reactions r
      JOIN tweets t ON r.tweet_id = t.tweet_id
      JOIN users u ON t.user_id = u.user_id
      LEFT JOIN tweets_media m ON t.tweet_id = m.tweet_id

      WHERE r.user_id = ?

      ORDER BY r.created_at DESC`,
      [loggedInUserId, userId]
    );

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};