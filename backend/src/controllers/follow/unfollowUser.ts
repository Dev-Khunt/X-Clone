import { Response } from "express";
import { AuthRequest } from "../../types";
import db from "../../config/db.config";

export const unfollowUser = async (req: AuthRequest, res: Response) => {
try {
const followeeId = Number(req.params.userId);
const followerId = req.user?.user_id;

//Prevent self-unfollow (optional but safe)
if (followeeId === followerId) {
return res.status(400).json({
message: "Invalid operation",
});
}
// Check if follow relationship exists
const [existing] = await db.query<any[]>(
`SELECT 1 FROM follow WHERE follower_id = ? AND followee_id = ?`,
[followerId, followeeId]
);
if (existing.length === 0) {return res.status(404).json({
message: "You are not following this user",
});
}
// Delete follow
await db.query(
`DELETE FROM follow WHERE follower_id = ? AND followee_id = ?`,
[followerId, followeeId]
);
res.status(200).json({
message: "Unfollowed successfully",
isFollowing: false,
});
} catch (err: any) {
res.status(500).json({ error: err.message });
}
};