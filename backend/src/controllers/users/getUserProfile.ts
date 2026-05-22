import { Request, Response } from "express";
import db from "../../config/db.config";
import { GetProfile } from "../../types";

export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const  username = req.params.username;

    const [profileResult] = await db.query<GetProfile[]>(`SELECT * FROM users WHERE username =?`,[username])

    if(profileResult.length == 0) {
        res.status(401).json({
            message : "User doesn't exist."
        });
        return;
    }
    res.status(201).send(profileResult[0])
    } catch (error) {
        res.status(500).json({ message: (error as Error).message })
    }
}