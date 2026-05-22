import { Response } from "express";
import { AuthRequest } from "../../types";
import db from "../../config/db.config";

export const followUser = async (req: AuthRequest, res: Response) => {
try {
const followeeId = Number(req.params.userId);
const followerId = req.user?.user_id;
// Prevent self-follow
if (followeeId === followerId) {
return res.status(400).json({
message: "You cannot follow yourself",
});
}
// Check if user exists
const [userRows] = await db.query<any[]>(
`SELECT user_id FROM users WHERE user_id = ?`,
[followeeId]
);
if (userRows.length === 0) {
return res.status(404).json({
message: "User not found",
});
}
// Check if already following
const [existing] = await db.query<any[]>(
`SELECT 1 FROM follow WHERE follower_id = ? AND followee_id = ?`,
[followerId, followeeId]
);if (existing.length > 0) {
return res.status(409).json({
message: "Already following this user",
});
}
// Insert follow
await db.query(
`INSERT INTO follow (follower_id, followee_id) VALUES (?, ?)`,
[followerId, followeeId]
);

res.status(201).json({
message: "Followed successfully",
isFollowing: true,
});
} catch (err: any) {
res.status(500).json({ error: err.message });
}
};