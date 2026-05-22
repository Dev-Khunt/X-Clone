import express from 'express';
import { getUserFollowers } from '../controllers/follow/getUserFollowers';
import { getUserFollowing } from '../controllers/follow/getUserFollowings';
import { followUser } from '../controllers/follow/followUser';
import { unfollowUser } from '../controllers/follow/unfollowUser';
import  verifyToken  from '../middleware/verifyToken';

const router = express.Router();

// Follow Routes
router.get("/:userId/followers",verifyToken,getUserFollowers);
router.get("/:userId/following",verifyToken,getUserFollowing);
router.post("/:userId",verifyToken,followUser);
router.delete("/:userId",verifyToken,unfollowUser);

export default router;