import { Response } from "express";
import { AuthRequest } from "../../types";
import db from "../../config/db.config";

export const globalSearch = async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim() === "") {
      return res.status(200).json({
        users: [],
        tweets: []
      });
    }

    const search = `%${query}%`;

    // 🔍 USERS
    const [users] = await db.query<any[]>(
      `SELECT user_id, username, display_name, profile_image
       FROM users
       WHERE username LIKE ? OR display_name LIKE ?
       LIMIT 10`,
      [search, search]
    );

    //  TWEETS
    const [tweets] = await db.query<any[]>(
      `SELECT
         t.tweet_id,
         t.content,
         t.created_at,
         u.username,
         u.display_name,
         u.profile_image
       FROM tweets t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.content LIKE ?
       ORDER BY t.created_at DESC
       LIMIT 10`,
      [search]
    );

    res.status(200).json({
      users,
      tweets
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};