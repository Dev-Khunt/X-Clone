import { Request, Response } from "express";
import { User } from "../../types";
import db from "../../config/db.config";
import config from '../../config/auth.config';
import jwt from 'jsonwebtoken'; 

export const generateToken = async (req: Request, res: Response) => {
  console.log(req.body);
  
  try {
    const { email } = req.body;
    const [rows] = await db.query<User[]>(
      `SELECT * FROM users WHERE email = ?`,
      [email],
    );

    if (rows.length === 0) {
      res.status(404).json({ message: "Email not found." });
      return;
    }
    
    const emailToken = jwt.sign({ email }, config.secret, {
      algorithm: "HS256",
      expiresIn: 20,
    });

    res.status(201).json({ message: "Unique token generated!", emailToken });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};