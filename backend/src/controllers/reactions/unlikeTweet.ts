import { Response } from "express";
import { AuthRequest } from "../../types";
import db from "../../config/db.config";

export const unlikeTweet = async (req: AuthRequest, res: Response) => {
try {
const tweetId = Number(req.params.tweetId);
const userId = req.user?.user_id;
// Check if like exists
const [existing] = await db.query<any[]>(
`SELECT 1 FROM reactions WHERE user_id = ? AND tweet_id = ?`,[userId, tweetId]
);
if (existing.length === 0) {
return res.status(404).json({
message: "Tweet not liked",
isLiked: false,
});
}
// Delete like
await db.query(
`DELETE FROM reactions WHERE user_id = ? AND tweet_id = ?`,
[userId, tweetId]
);
res.status(200).json({
message: "Tweet unliked successfully",
isLiked: false,
});
} catch (err: any) {
res.status(500).json({ error: err.message });
}
};