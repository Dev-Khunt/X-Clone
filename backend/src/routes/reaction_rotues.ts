import express from 'express';
import { likeTweet } from '../controllers/reactions/likeTweet';
import { unlikeTweet } from '../controllers/reactions/unlikeTweet';
import  verifyToken  from '../middleware/verifyToken';
import { likeComment } from '../controllers/reactions/likeComment';
import { unlikeComment } from '../controllers/reactions/unlikeComment';

const router = express.Router();

// Reaction Routes

// tweets reaction
router.post("/tweets/:tweetId",verifyToken,likeTweet);
router.delete("/tweets/:tweetId",verifyToken,unlikeTweet);

// comment reaction
router.post("/comments/:commentId",verifyToken,likeComment);
router.delete("/comments/:commentId",verifyToken,unlikeComment);


export default router;