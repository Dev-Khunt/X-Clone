import { Response } from "express";
import { AuthRequest, Follower } from "../../types";
import db from "../../config/db.config";

export const getUserFollowers = async (req: AuthRequest, res: Response) => {
try {
const userId = Number(req.params.userId);
// Optional: check if user exists
const [userRows] = await db.query<any[]>(
`SELECT user_id FROM users WHERE user_id = ?`,
[userId]
);
if (userRows.length === 0) {
return res.status(404).json({ message: "User not found" });
}
const [result] = await db.query<Follower[]>(
`SELECT
u.user_id,
u.username,
u.display_name,
u.profile_image
FROM follow f
JOIN users u ON f.follower_id = u.user_id
WHERE f.followee_id = ?`,
[userId]
);
res.status(200).json(result);
} catch (err: any) {
res.status(500).json({ error: err.message });
}
};