import { Response } from "express";
import { AuthRequest } from "../../types";
import db from "../../config/db.config";

export const undoRetweet = async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = Number(req.params.tweetId);
    const userId = req.user?.user_id;

    // Check if retweet exists
    const [existing] = await db.query<any[]>(
      `SELECT 1 FROM retweets WHERE user_id = ? AND tweet_id = ?`,
      [userId, tweetId],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        message: "Retweet not found",
      });
    }

    // Delete retweet
    await db.query(`DELETE FROM retweets WHERE user_id = ? AND tweet_id = ?`, [
      userId,
      tweetId,
    ]);

    res.status(200).json({
      message: "Retweet removed successfully",
      isRetweeted: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
