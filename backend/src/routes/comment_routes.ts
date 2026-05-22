import express from 'express';
import { createComment } from '../controllers/comments/createComments';
import { addReply } from '../controllers/comments/addReply';
import { getCommentsByTweet } from '../controllers/comments/getCommentByTweets';
import { getRepliesByCommentId } from '../controllers/comments/getRepliesByComments';
import { deleteComment } from '../controllers/comments/deleteComment';
import  verifyToken  from '../middleware/verifyToken';

const router = express.Router();

// Comment Routes
router.post("/:tweetId",verifyToken,createComment);
router.post("/reply/:commentId",verifyToken,addReply);
router.get("/tweet/:tweetId",verifyToken,getCommentsByTweet);
router.get("/replies/:commentId",verifyToken,getRepliesByCommentId);
router.delete("/:id",verifyToken,deleteComment);

export default router;