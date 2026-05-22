import { Response } from "express";
import { AuthRequest } from "../../types";
import db from "../../config/db.config";

export const unlikeComment = async (req: AuthRequest, res: Response) => {
try {
const commentId = Number(req.params.commentId);
const userId = req.user?.user_id;
// Check if like exists
const [existing] = await db.query<any[]>(
`SELECT 1 FROM comment_reactions WHERE user_id = ? AND comment_id = ?`,
[userId, commentId]
);
if (existing.length === 0) {
return res.status(404).json({
message: "Comment not liked",
isLiked: false,
});
}
// Delete like
await db.query(
`DELETE FROM comment_reactions WHERE user_id = ? AND comment_id = ?`,
[userId, commentId]
);
res.status(200).json({
message: "Comment unliked successfully",
isLiked: false,
});
} catch (err: any) {
res.status(500).json({ error: err.message });
}
};