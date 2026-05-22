import { NextFunction, Request, Response } from "express";
import { AuthRequest, User } from "../types";
import jwt,{ JwtPayload } from "jsonwebtoken";
import db from "../config/db.config";
import config from "../config/auth.config"


const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  let token = req.headers["authorization"];
  
  if (!token || typeof token !== "string") {
    res.status(403).json({ message: "No token provided!" });
    return;
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  try {
    const decoded = jwt.verify(token, config.secret) as JwtPayload;
    console.log(decoded);
    
    const [rows] = await db.query<User[]>(
      `SELECT * FROM users WHERE user_id = ?`,
      [decoded.id],
    );
    console.log(rows);
    

    if (rows.length == 0) {
      res.status(404).json({ message: "User Not found." });
      return;
    }
    req.user = rows[0];

    next();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export default verifyToken