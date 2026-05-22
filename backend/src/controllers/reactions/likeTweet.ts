import { Response } from "express";
import { AuthRequest, DBResult } from "../../types";
import db from "../../config/db.config";

export const likeTweet = async (req: AuthRequest, res: Response) => {
try {
const tweetId = Number(req.params.tweetId);
const userId = req.user?.user_id;
// Check if tweet exists
const [tweetRows] = await db.query<any[]>(
`SELECT tweet_id FROM tweets WHERE tweet_id = ?`,
[tweetId]
);
if (tweetRows.length === 0) {
return res.status(404).json({
message: "Tweet not found",
});
}
// Insert like (ignore duplicate)
const [result] = await db.query<DBResult>(
`INSERT INTO reactions (user_id, tweet_id)
VALUES (?, ?)`,
[userId, tweetId]
);
// If already liked
if (result.affectedRows === 0) {
return res.status(409).json({
message: "Tweet already liked",
isLiked: true,
});
}
res.status(201).json({
message: "Tweet liked successfully",
isLiked: true,
});
} catch (err: any) {
res.status(500).json({ error: err.message });
}
};