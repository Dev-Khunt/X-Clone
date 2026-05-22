import { Response } from "express";
import { AuthRequest, Comment } from "../../types";
import db from "../../config/db.config";

export const getCommentsByTweet = async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = Number(req.params.tweetId);

    // check if tweet exists
    const [tweetRows] = await db.query<any[]>(
      `SELECT tweet_id FROM tweets WHERE tweet_id = ?`,
      [tweetId],
    );
    if (tweetRows.length === 0) {
      return res.status(404).json({
        message: "Tweet not found",
      });
    }
    const [result] = await db.query<Comment[]>(
      `SELECT
c.comment_id,
c.user_id,
c.content,
c.created_at,
u.username,
u.display_name,
u.profile_image
FROM comments c
JOIN users u ON c.user_id = u.user_id
WHERE c.tweet_id = ?
AND c.parent_comment_id IS NULL
ORDER BY c.created_at DESC`,
      [tweetId],
    );
    // Normalize created_at
    const normalized = (result as any[]).map(row => ({
      ...row,
      created_at: new Date(row.created_at).toISOString()
    }));
    res.status(200).json(normalized);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
