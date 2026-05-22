import { Response } from "express";
import { AuthRequest, DBResult } from "../../types";
import db from "../../config/db.config";

export const likeComment = async (req: AuthRequest, res: Response) => {
try {
const commentId = Number(req.params.commentId);
const userId = req.user?.user_id;
// Check if comment exists
const [commentRows] = await db.query<any[]>(
`SELECT user_id, tweet_id FROM comments WHERE comment_id = ?`,
[commentId]
);
if (commentRows.length === 0) {
return res.status(404).json({
message: "Comment not found",
});
}
const commentOwnerId = commentRows[0].user_id;
const tweetId = commentRows[0].tweet_id;
// Insert like (ignore duplicate)
const [result] = await db.query<DBResult>(
`INSERT IGNORE INTO comment_reactions (user_id, comment_id)
VALUES (?, ?)`,
[userId, commentId]
);
// Already liked
if (result.affectedRows === 0) {
return res.status(409).json({
message: "Comment already liked",isLiked: true,
});
}
res.status(201).json({
message: "Comment liked successfully",
isLiked: true,
});
} catch (err: any) {
res.status(500).json({ error: err.message });
}
};