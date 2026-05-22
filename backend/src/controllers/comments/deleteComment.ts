import { Response } from "express";
import db from "../../config/db.config";
import { AuthRequest } from "../../types";

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.user_id;

    // Check if comment exists
    const [rows] = await db.query<any[]>(
      `SELECT user_id FROM comments WHERE comment_id = ?`,
      [commentId],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    // Ownership check
    if (rows[0].user_id !== userId) {
      return res.status(403).json({
        message: "Unauthorized to delete this comment",
      });
    }

    // Delete comment
    await db.query(`DELETE FROM comments WHERE comment_id = ?`, [commentId]);
    res.status(200).json({
      message: "Comment deleted successfully",
      comment_id: commentId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
