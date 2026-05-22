import express from "express";
import { globalSearch } from "../controllers/search/search";
import  verifyToken  from "../middleware/verifyToken";

const router = express.Router();

router.get("/", verifyToken, globalSearch);

export default router;