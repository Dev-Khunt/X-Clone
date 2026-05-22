import { Response } from "express";
import { AuthRequest, ReplyBody } from "../../types";
import db from "../../config/db.config";

export const addReply = async (req: AuthRequest, res: Response) => {
  try {
    const parentCommentId = Number(req.params.commentId);
    const userId = req.user?.user_id;
    const { content }= req.body || {};
    // Validate content
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Reply content is required",
      });
    }

    // Get parent comment
    const [parentRows] = await db.query<any[]>(
      `SELECT tweet_id, user_id FROM comments WHERE comment_id = ?`,
      [parentCommentId],
    );
    if (parentRows.length === 0) {
      return res.status(404).json({
        message: "Parent comment not found",
      });
    }
    const tweetId = parentRows[0].tweet_id;
    const parentCommentUserId = parentRows[0].user_id;

    // Insert reply
    const [result]: any = await db.query(
      `INSERT INTO comments (user_id, tweet_id, content, parent_comment_id)
VALUES (?, ?, ?, ?)`,
      [userId, tweetId, content, parentCommentId],
    );
    const replyId = result.insertId;
    res.status(201).json({
      message: "Reply added successfully",
      comment_id: replyId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
