import express from "express";
import { retweetTweet } from "../controllers/retweets/retweetTweet";
import { undoRetweet } from "../controllers/retweets/undoRetweet";
import  verifyToken  from "../middleware/verifyToken";

const router = express.Router();

//Retweet Routes
router.post("/:tweetId",verifyToken,retweetTweet);
router.delete("/:tweetId",verifyToken,undoRetweet);

export default router;