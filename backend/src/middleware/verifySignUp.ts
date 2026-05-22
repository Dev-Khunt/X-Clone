import { NextFunction, Request, Response } from "express";
import db from "../config/db.config";
import { ResultSetHeader } from "mysql2";
import { User } from "../types";

export const checkDuplicateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

    try {
        const {
            email,
            username
        } = req.body;

        const [result] = await db.query<User[]>(`SELECT email,username FROM users WHERE email= ? OR username=?`,[email,username])

        console.log(result.length);

        
    if(result.length > 0) {
        res.status(403).json({
            message : "User already exists"
        });
        return;
    }
        next();
    } catch (error) {
        res.status(403).json({
            message : error
        })
    }
};
