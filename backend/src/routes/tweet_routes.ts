import express from 'express';
import { getFeedTweets } from '../controllers/tweets/getFeedTweets';
import { getTweetById } from '../controllers/tweets/getTweetsById';
import { getTweetsByUser } from '../controllers/tweets/getTweetsByUser';
import { deleteTweet } from '../controllers/tweets/deleteTweet';
import verifyToken  from '../middleware/verifyToken';
import { upload } from '../middleware/upload.middleware';
import { addTweet } from '../controllers/tweets/addTweet';

const router = express.Router();

//Tweets routes
router.get("/feed",verifyToken,getFeedTweets);
router.get("/:id",verifyToken,getTweetById);
router.get("/user/:userId",verifyToken,getTweetsByUser);
router.delete("/:id",verifyToken,deleteTweet);
router.post("/",verifyToken,upload.single("tweet"),addTweet)


export default router;