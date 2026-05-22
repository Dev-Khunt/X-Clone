import { Response } from "express";
import { AuthRequest } from "../../types";
import db from "../../config/db.config";

export const deleteTweet = async (req: AuthRequest, res: Response) => {
  try {
    const tweetId = Number(req.params.id);
    const userId = req.user?.user_id;

    // Check if tweet exists and belongs to user
    const [rows] = await db.query<any[]>(
      `SELECT user_id FROM tweets WHERE tweet_id = ?`,
      [tweetId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tweet not found" });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized to delete this tweet" });
    }

    // Delete tweet
    const [result] = await db.query(
      `DELETE FROM tweets WHERE tweet_id = ?`,
      [tweetId]
    );

    res.status(200).json({
      message: "Tweet deleted successfully",
      tweet_id: tweetId,
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};