import { getUserProfile } from "../controllers/users/getUserProfile";
import express from 'express'
import { getUserTweets } from "../controllers/users/getUserTweets";
import  verifyToken  from "../middleware/verifyToken";
import { getUserComments } from "../controllers/users/getUserComments";
import { getUserLikes } from "../controllers/users/getUserLikes";
import { uploadProfile, uploadCover, updateProfile } from "../controllers/user.controller";
import { upload } from "../middleware/upload.middleware";

const router = express.Router();


// User Routes
router.get("/:username",verifyToken,getUserProfile);
router.get("/:username/tweets",verifyToken,getUserTweets);
router.get("/:username/comments",verifyToken,getUserComments);
router.get("/:username/likes",verifyToken,getUserLikes);

// Profile Update Routes
router.put("/:id", verifyToken, updateProfile);
router.post("/:id/profile-image", verifyToken, upload.single("profileImage"), uploadProfile);
router.post("/:id/cover-image", verifyToken, upload.single("coverImage"), uploadCover);


export default router;