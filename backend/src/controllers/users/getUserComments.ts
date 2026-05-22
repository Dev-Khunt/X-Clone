import { Response } from "express";
import db from "../../config/db.config";
import { AuthRequest } from "../../types";

export const getUserComments = async (req: AuthRequest, res: Response) => {
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

    // Fetch top-level comments with their parent tweet context
    const [result] = await db.query<any[]>(
      `SELECT 
        c.comment_id,
        c.user_id,
        c.content,
        c.created_at,
        u.username,
        u.display_name,
        u.profile_image,
        c.tweet_id,
        t.content        AS tweet_content,
        tu.username      AS tweet_username,
        tu.display_name  AS tweet_display_name,
        tu.profile_image AS tweet_profile_image,
        (
          SELECT COUNT(*) 
          FROM comment_reactions cr 
          WHERE cr.comment_id = c.comment_id
        ) AS like_count,
        EXISTS (
          SELECT 1 
          FROM comment_reactions cr2 
          WHERE cr2.comment_id = c.comment_id AND cr2.user_id = ?
        ) AS isLiked
      FROM comments c
      JOIN users u  ON c.user_id  = u.user_id
      JOIN tweets t ON c.tweet_id = t.tweet_id
      JOIN users tu ON t.user_id  = tu.user_id
      WHERE c.user_id = ?
        AND c.parent_comment_id IS NULL
      ORDER BY c.created_at DESC`,
      [loggedInUserId, userId]
    );

    // Normalize created_at
    const normalized = result.map(row => ({
      ...row,
      created_at: new Date(row.created_at).toISOString()
    }));

    res.status(200).json(normalized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};