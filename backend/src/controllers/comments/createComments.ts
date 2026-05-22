import { Response } from "express";
import { AuthRequest, CreateCommentBody } from "../../types";
import db from "../../config/db.config";

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = Number(req.params.tweetId);
    const userId = req.user?.user_id;
    const { content }: CreateCommentBody = req.body;

    // Validate Content
    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }
    // Check if tweet exists
    const [tweetRows] = await db.query<any[]>(
      `SELECT user_id FROM tweets WHERE tweet_id = ?`,
      [tweetId],
    );
    if (tweetRows.length === 0) {
      return res.status(404).json({
        message: "Tweet not found",
      });
    }
    const tweetOwnerId = tweetRows[0].user_id;
    // Insert comment
    const [result]: any = await db.query(
      `INSERT INTO comments (user_id, tweet_id, content, parent_comment_id)
VALUES (?, ?, ?, NULL)`,
      [userId, tweetId, content],
    );
    const commentId = result.insertId;
    res.status(201).json({
      message: "Comment added successfully",
      comment_id: commentId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
