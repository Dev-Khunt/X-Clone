import { Response } from "express";
import { AuthRequest, Reply } from "../../types";
import db from "../../config/db.config";

export const getRepliesByCommentId = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const parentCommentId = Number(req.params.commentId);

    // check if parent comment exists
    const [parentRows] = await db.query<any[]>(
      `SELECT comment_id FROM comments WHERE comment_id = ?`,
      [parentCommentId],
    );
    if (parentRows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const [result] = await db.query<Reply[]>(
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
WHERE c.parent_comment_id = ?
ORDER BY c.created_at ASC`,
      [parentCommentId],
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
